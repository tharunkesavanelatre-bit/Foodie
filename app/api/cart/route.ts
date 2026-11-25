import { NextRequest, NextResponse, connection } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { foods } from "@/data/foods";
import { getRecipePrice } from "@/features/product-details/utils/recipePrice";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const items = await prisma.cartItem.findMany({
      where: {
        cart: { userId: user.id },
      },
      select: {
        id: true,
        foodId: true,
        idMeal: true,
        name: true,
        price: true,
        image: true,
        category: true,
        quantity: true,
      },
    });

    return NextResponse.json(
      {
        items: items.map((item) => ({
          ...item,
          price: item.price.toString(),
          image: item.image || "",
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Cart fetch error:", error);

    return NextResponse.json(
      { message: "Unable to fetch cart." },
      { status: 500 }
    );
  }
}

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

    const foodId = body.foodId ? String(body.foodId) : null;
    const idMeal = body.idMeal ? String(body.idMeal) : null;

    const requestedName = String(body.name || "").trim();

    let name = "";
    let price = 0;
    let image = "";
    let category: string | null = null;
    let restaurantId: string | null = null;

    // Restaurant food
    if (foodId) {
      const food = await prisma.food.findFirst({
        where: {
          id: foodId,
          isAvailable: true,
          restaurant: {
            status: "APPROVED",
            isOpen: true,
          },
        },
        select: {
          name: true,
          price: true,
          image: true,
          category: true,
          restaurantId: true,
        },
      });

      if (!food || !food.restaurantId) {
        return NextResponse.json(
          {
            message: "This restaurant food is currently unavailable.",
          },
          { status: 404 }
        );
      }

      name = food.name;
      price = Number(food.price);
      image = food.image || "";
      category = food.category;
      restaurantId = food.restaurantId;
    }

    // TheMealDB recipe
    else if (idMeal) {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(idMeal)}`,
        {
          signal: AbortSignal.timeout(10000),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return NextResponse.json(
          { message: "Unable to verify recipe." },
          { status: 502 }
        );
      }

      const data = await response.json();
      const meal = data.meals?.[0];

      if (!meal) {
        return NextResponse.json(
          { message: "Recipe not found." },
          { status: 404 }
        );
      }

      name = meal.strMeal;
      image = meal.strMealThumb || "";
      category = meal.strCategory || null;

      price = getRecipePrice(
        idMeal,
        name,
        category || undefined
      );
    }

    // Static catalogue food
    else {
      const staticFood = foods.find(
        (item) =>
          item.name.toLowerCase() === requestedName.toLowerCase()
      );

      if (!staticFood) {
        return NextResponse.json(
          { message: "Invalid food item." },
          { status: 400 }
        );
      }

      name = staticFood.name;
      price = Number(
        staticFood.price.replace(/[^\d.]/g, "")
      );
      image = staticFood.image;
      category = staticFood.category;
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { message: "Invalid food price." },
        { status: 400 }
      );
    }

    // Find or create cart
    const cart = await prisma.cart.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
      },
      update: {},
    });

    // Run independent database reads together
    const [existingItems, existingItem] = await Promise.all([
      prisma.cartItem.findMany({
        where: {
          cartId: cart.id,
        },
        select: {
          foodId: true,
          food: {
            select: {
              restaurantId: true,
            },
          },
        },
      }),

      prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          ...(foodId
            ? { foodId }
            : idMeal
              ? { idMeal }
              : { name }),
        },
      }),
    ]);

    // Prevent mixing restaurant orders
    // or combining different restaurants
    if (foodId) {
      const hasDifferentRestaurant = existingItems.some(
        (item) =>
          item.food?.restaurantId !== restaurantId
      );

      if (hasDifferentRestaurant) {
        return NextResponse.json(
          {
            message:
              "Please complete your current cart before ordering from another food source or restaurant.",
          },
          { status: 409 }
        );
      }
    } else if (existingItems.some((item) => item.foodId)) {
      return NextResponse.json(
        {
          message:
            "Please complete your restaurant order before adding other foods.",
        },
        { status: 409 }
      );
    }

    // Update existing item or create new item
    const savedItem = existingItem
      ? await prisma.cartItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: {
              increment: 1,
            },
            price,
            name,
            image,
            category,
          },
        })
      : await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            foodId,
            idMeal,
            name,
            price,
            image,
            category,
            quantity: 1,
          },
        });

    return NextResponse.json(
      {
        success: true,
        message: "Item added to cart.",
        item: {
          ...savedItem,
          price: savedItem.price.toString(),
          image: savedItem.image || "",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Cart add error:", error);

    return NextResponse.json(
      {
        message: "Unable to add item to cart.",
      },
      { status: 500 }
    );
  }
}
