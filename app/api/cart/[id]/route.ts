import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

// Update quantity
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
    const { quantity } = await request.json();

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { message: "Invalid quantity." },
        { status: 400 }
      );
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: { userId: user.id },
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Cart item not found." },
        { status: 404 }
      );
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return NextResponse.json({
      message: "Quantity updated.",
    });
  } catch (error) {
    console.error("Cart update error:", error);

    return NextResponse.json(
      { message: "Unable to update quantity." },
      { status: 500 }
    );
  }
}

// Remove item
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
        cart: { userId: user.id },
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Cart item not found." },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Item removed.",
    });
  } catch (error) {
    console.error("Cart remove error:", error);

    return NextResponse.json(
      { message: "Unable to remove item." },
      { status: 500 }
    );
  }
}