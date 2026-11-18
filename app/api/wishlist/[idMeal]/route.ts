import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ idMeal: string }> }
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

    const { idMeal } = await params;

    const item = await prisma.wishlistItem.findFirst({
      where: {
        idMeal,
        wishlist: {
          userId: user.id,
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Recipe not found." },
        { status: 404 }
      );
    }

    await prisma.wishlistItem.delete({
      where: { id: item.id },
    });

    return NextResponse.json({
      message: "Recipe removed from wishlist.",
    });
  } catch (error) {
    console.error("Wishlist delete error:", error);

    return NextResponse.json(
      { message: "Unable to remove recipe." },
      { status: 500 }
    );
  }
}