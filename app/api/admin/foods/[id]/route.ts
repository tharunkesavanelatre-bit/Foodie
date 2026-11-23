import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";

type Context = {
  params: Promise<{ id: string }>;
};

// PATCH - Update food
export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.FOODS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const data: {
      name?: string;
      description?: string;
      category?: string;
      image?: string;
      price?: number;
      isAvailable?: boolean;
    } = {};

    for (const field of ["name", "description", "category", "image"] as const) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string" || !body[field].trim()) {
          return NextResponse.json(
            { message: `Invalid ${field}.` },
            { status: 400 }
          );
        }

        data[field] = body[field].trim();
      }
    }

    if (body.price !== undefined) {
      if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price <= 0) {
        return NextResponse.json(
          { message: "Invalid price." },
          { status: 400 }
        );
      }

      data.price = body.price;
    }

    if (body.isAvailable !== undefined) {
      if (typeof body.isAvailable !== "boolean") {
        return NextResponse.json(
          { message: "Invalid availability." },
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

    const result = await prisma.food.updateMany({
      where: { id },
      data,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Food item not found." },
        { status: 404 }
      );
    }

    const food = await prisma.food.findUnique({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Food updated successfully.",
      food: {
        ...food,
        price: Number(food!.price),
      },
    });
  } catch (error) {
    console.error("Admin food update error:", error);

    return NextResponse.json(
      { message: "Unable to update food." },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate food
export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.FOODS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const result = await prisma.food.updateMany({
      where: { id, isAvailable: true },
      data: { isAvailable: false },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Available food item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Food deactivated successfully.",
    });
  } catch (error) {
    console.error("Admin food deactivation error:", error);

    return NextResponse.json(
      { message: "Unable to deactivate food." },
      { status: 500 }
    );
  }
}