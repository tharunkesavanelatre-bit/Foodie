import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedUser } from "@/lib/authorization";
import { ROLES } from "@/lib/roles";

type Context = {
  params: Promise<{ id: string }>;
};

// PATCH - Update food item
export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  await connection();

  try {
    const user = await getAuthorizedUser(request, [ROLES.RESTAURANT]);

    if (!user) {
      return NextResponse.json(
        { message: "Restaurant access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: user.id },
    });

    if (!restaurant || restaurant.status !== "APPROVED") {
      return NextResponse.json(
        { message: "Approved restaurant not found." },
        { status: 403 }
      );
    }

    const existingFood = await prisma.food.findFirst({
      where: {
        id,
        restaurantId: restaurant.id,
      },
    });

    if (!existingFood) {
      return NextResponse.json(
        { message: "Food item not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const data: {
      name?: string;
      description?: string;
      category?: string;
      image?: string;
      price?: number;
      isAvailable?: boolean;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { message: "Invalid food name." },
          { status: 400 }
        );
      }
      data.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string" ||
        !body.description.trim()
      ) {
        return NextResponse.json(
          { message: "Invalid description." },
          { status: 400 }
        );
      }
      data.description = body.description.trim();
    }

    if (body.category !== undefined) {
      if (typeof body.category !== "string" || !body.category.trim()) {
        return NextResponse.json(
          { message: "Invalid category." },
          { status: 400 }
        );
      }
      data.category = body.category.trim();
    }

    if (body.image !== undefined) {
      if (typeof body.image !== "string" || !body.image.trim()) {
        return NextResponse.json(
          { message: "Invalid image." },
          { status: 400 }
        );
      }
      data.image = body.image.trim();
    }

    if (body.price !== undefined) {
      const price = Number(body.price);

      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { message: "Invalid food price." },
          { status: 400 }
        );
      }

      data.price = price;
    }

    if (body.isAvailable !== undefined) {
      if (typeof body.isAvailable !== "boolean") {
        return NextResponse.json(
          { message: "Invalid availability value." },
          { status: 400 }
        );
      }

      data.isAvailable = body.isAvailable;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "No changes provided." },
        { status: 400 }
      );
    }

    const food = await prisma.food.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Food item updated successfully.",
      food: {
        ...food,
        price: Number(food.price),
      },
    });
  } catch (error) {
    console.error("Update food error:", error);

    return NextResponse.json(
      { message: "Unable to update food item." },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate food item
export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  await connection();

  try {
    const user = await getAuthorizedUser(request, [ROLES.RESTAURANT]);

    if (!user) {
      return NextResponse.json(
        { message: "Restaurant access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: user.id },
    });

    if (!restaurant || restaurant.status !== "APPROVED") {
      return NextResponse.json(
        { message: "Approved restaurant not found." },
        { status: 403 }
      );
    }

    const result = await prisma.food.updateMany({
      where: {
        id,
        restaurantId: restaurant.id,
        isAvailable: true,
      },
      data: {
        isAvailable: false,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Available food item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Food item removed from menu successfully.",
    });
  } catch (error) {
    console.error("Delete food error:", error);

    return NextResponse.json(
      { message: "Unable to remove food item." },
      { status: 500 }
    );
  }
}