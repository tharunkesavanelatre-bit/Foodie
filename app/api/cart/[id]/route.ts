import { NextRequest, NextResponse, connection } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const MAX_CART_QUANTITY = 99;

type Context = {
  params: Promise<{ id: string }>;
};

// UPDATE CART QUANTITY

export async function PATCH(
  request: NextRequest,
  context: Context
) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const quantity = body.quantity;

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_CART_QUANTITY
    ) {
      return NextResponse.json(
        {
          message: `Quantity must be between 1 and ${MAX_CART_QUANTITY}.`,
        },
        { status: 400 }
      );
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: {
          userId: user.id,
        },
      },
      include: {
        food: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Cart item not found." },
        { status: 404 }
      );
    }

    if (
      item.foodId &&
      (
        !item.food ||
        !item.food.isAvailable ||
        item.food.restaurant?.status !== "APPROVED" ||
        !item.food.restaurant.isOpen
      )
    ) {
      return NextResponse.json(
        { message: "This food is currently unavailable." },
        { status: 409 }
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cart quantity updated.",
      item: {
        ...updatedItem,
        price: updatedItem.price.toString(),
        image: updatedItem.image || "",
      },
    });
  } catch (error) {
    console.error("Cart update error:", error);

    return NextResponse.json(
      { message: "Unable to update cart quantity." },
      { status: 500 }
    );
  }
}

// REMOVE CART ITEM

export async function DELETE(
  request: NextRequest,
  context: Context
) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: {
          userId: user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Cart item not found." },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: {
        id: item.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Item removed successfully.",
    });
  } catch (error) {
    console.error("Cart delete error:", error);

    return NextResponse.json(
      { message: "Unable to remove cart item." },
      { status: 500 }
    );
  }
}