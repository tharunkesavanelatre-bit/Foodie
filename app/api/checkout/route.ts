import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

    const { name, phone, address, city, pincode, payment } = body;

    if (!name || !phone || !address || !city || !pincode || !payment) {
      return NextResponse.json(
        { message: "Please complete all delivery details." },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: user.id },
        include: { items: true },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty.");
      }

      const subtotal = cart.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );

      const delivery = 30;
      const total = subtotal + delivery;

      const newOrder = await tx.order.create({
        data: {
          orderId: `FD${Date.now()}`,
          userId: user.id,
          name,
          phone,
          address,
          city,
          pincode,
          payment,
          subtotal,
          delivery,
          total,
          status: "Pending",
          items: {
            create: cart.items.map((item) => ({
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully. Waiting for restaurant confirmation.",
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        delivery: Number(order.delivery),
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to place your order.",
      },
      { status: 500 }
    );
  }
}
