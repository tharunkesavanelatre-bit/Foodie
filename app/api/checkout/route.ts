import { NextRequest, NextResponse, connection } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { foods } from "@/data/foods";
import { getRecipePrice } from "@/features/product-details/utils/recipePrice";

export async function POST(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const city = String(body.city || "").trim();
    const pincode = String(body.pincode || "").trim();
    const payment = String(body.payment || "").trim();

    const couponCode = String(body.couponCode || "")
      .trim()
      .toUpperCase();

    if (!name || !phone || !address || !city || !pincode || !payment) {
      return NextResponse.json(
        { message: "Please complete all checkout fields." },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              food: {
                include: { restaurant: true },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty.");
      }

      let subtotal = 0;
      let restaurantId: string | null = null;
      let hasRestaurantFood = false;
      let hasOtherFood = false;

      const orderItems = [];

      for (const item of cart.items) {
        let price = 0;
        let itemName = item.name;
        let image = item.image || "";

        if (item.foodId) {
          const food = item.food;

          if (
            !food ||
            !food.isAvailable ||
            !food.restaurant ||
            food.restaurant.status !== "APPROVED" ||
            !food.restaurant.isOpen
          ) {
            throw new Error(`${item.name} is currently unavailable.`);
          }

          if (restaurantId && restaurantId !== food.restaurantId) {
            throw new Error(
              "Your cart contains foods from different restaurants."
            );
          }

          restaurantId = food.restaurantId;
          hasRestaurantFood = true;

          price = Number(food.price);
          itemName = food.name;
          image = food.image || "";
        } else if (item.idMeal) {
          hasOtherFood = true;

          price = getRecipePrice(
            item.idMeal,
            item.name,
            item.category || undefined
          );
        } else {
          hasOtherFood = true;

          const staticFood = foods.find(
            (food) => food.name.toLowerCase() === item.name.toLowerCase()
          );

          if (!staticFood) {
            throw new Error(`${item.name} is no longer available.`);
          }

          price = Number(staticFood.price.replace(/[^\d.]/g, ""));
          itemName = staticFood.name;
          image = staticFood.image;
        }

        if (!Number.isFinite(price) || price <= 0) {
          throw new Error(`Invalid price for ${item.name}.`);
        }

        subtotal += price * item.quantity;

        orderItems.push({
          name: itemName,
          price,
          image,
          quantity: item.quantity,
        });
      }

      if (hasRestaurantFood && hasOtherFood) {
        throw new Error("Your cart contains incompatible food items.");
      }

      const delivery = 30;

      // Validate and calculate coupon discount.
      let discount = 0;
      let couponId: string | null = null;
      let appliedCouponCode: string | null = null;

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode },
        });

        if (!coupon) {
          throw new Error("Invalid coupon code.");
        }

        const now = new Date();

        if (!coupon.isActive) {
          throw new Error("This coupon is inactive.");
        }

        if (coupon.startsAt && coupon.startsAt > now) {
          throw new Error("This coupon is not available yet.");
        }

        if (coupon.expiresAt && coupon.expiresAt < now) {
          throw new Error("This coupon has expired.");
        }

        if (
          coupon.usageLimit !== null &&
          coupon.usageCount >= coupon.usageLimit
        ) {
          throw new Error("This coupon has reached its usage limit.");
        }

        if (subtotal < Number(coupon.minOrderAmount)) {
          throw new Error(
            `Minimum order amount for this coupon is â‚¹${Number(
              coupon.minOrderAmount
            ).toFixed(2)}.`
          );
        }

        if (coupon.discountType === "PERCENTAGE") {
          discount = (subtotal * Number(coupon.discountValue)) / 100;

          if (coupon.maxDiscount !== null) {
            discount = Math.min(
              discount,
              Number(coupon.maxDiscount)
            );
          }
        } else if (coupon.discountType === "FIXED") {
          discount = Number(coupon.discountValue);
        } else {
          throw new Error("Invalid coupon discount configuration.");
        }

        // Discount cannot exceed the food subtotal.
        discount = Math.min(subtotal, Math.max(0, discount));

        // Keep monetary values to two decimal places.
        discount = Math.round(discount * 100) / 100;

        couponId = coupon.id;
        appliedCouponCode = coupon.code;

        // Atomically reserve one usage slot when a limit exists.
        if (coupon.usageLimit !== null) {
          const usageUpdate = await tx.coupon.updateMany({
            where: {
              id: coupon.id,
              isActive: true,
              usageCount: {
                lt: coupon.usageLimit,
              },
            },
            data: {
              usageCount: {
                increment: 1,
              },
            },
          });

          if (usageUpdate.count === 0) {
            throw new Error("This coupon has reached its usage limit.");
          }
        } else {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: {
              usageCount: {
                increment: 1,
              },
            },
          });
        }
      }

      const total = Math.round((subtotal - discount + delivery) * 100) / 100;

      const newOrder = await tx.order.create({
        data: {
          orderId: `FD${Date.now()}${randomUUID()
            .slice(0, 6)
            .toUpperCase()}`,
          userId: user.id,
          restaurantId,
          name,
          phone,
          address,
          city,
          pincode,
          payment,
          subtotal,
          delivery,
          discount,
          couponCode: appliedCouponCode,
          couponId,
          total,
          status: "Pending",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Automatically create payment record.
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: payment,
          amount: total,
          status: "PENDING",
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        delivery: Number(order.delivery),
        discount: Number(order.discount),
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to place order.";

    const couponError =
      message.toLowerCase().includes("coupon") ||
      message.toLowerCase().includes("minimum order");

    const status =
      couponError ||
      message.includes("cart") ||
      message.includes("unavailable") ||
      message.includes("price") ||
      message.includes("restaurant") ||
      message.includes("available")
        ? 400
        : 500;

    return NextResponse.json({ message }, { status });
  }
}
