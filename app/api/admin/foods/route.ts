import { NextRequest, NextResponse, connection } from "next/server";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

// GET – View all food items
export async function GET(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(request, PERMISSIONS.FOODS);

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied" },
        { status: 403 }
      );
    }

    const foods = await prisma.food.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, foods });
  } catch (error) {
    console.error("Fetch foods error:", error);

    return NextResponse.json(
      { message: "Unable to fetch foods" },
      { status: 500 }
    );
  }
}

// POST – Add food
export async function POST(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(request, PERMISSIONS.FOODS);

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const price = Number(body.price);

    if (!name || !category || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { message: "Enter a valid name, category and price" },
        { status: 400 }
      );
    }

    const food = await prisma.food.create({
      data: {
        name,
        category,
        price,
        description:
          typeof body.description === "string"
            ? body.description.trim()
            : null,
        image:
          typeof body.image === "string" ? body.image.trim() : null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Food added successfully", food },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add food error:", error);

    return NextResponse.json(
      { message: "Unable to add food" },
      { status: 500 }
    );
  }
}

// PUT – Update food
export async function PUT(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(request, PERMISSIONS.FOODS);

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const price = Number(body.price);

    if (!id || !name || !category || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { message: "Invalid food information" },
        { status: 400 }
      );
    }

    const food = await prisma.food.update({
      where: { id },
      data: {
        name,
        category,
        price,
        description:
          typeof body.description === "string"
            ? body.description.trim()
            : null,
        image:
          typeof body.image === "string" ? body.image.trim() : null,
        isAvailable: body.isAvailable !== false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Food updated successfully",
      food,
    });
  } catch (error) {
    console.error("Update food error:", error);

    return NextResponse.json(
      { message: "Unable to update food" },
      { status: 500 }
    );
  }
}

// DELETE – Remove food
export async function DELETE(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(request, PERMISSIONS.FOODS);

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied" },
        { status: 403 }
      );
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Food ID is required" },
        { status: 400 }
      );
    }

    await prisma.food.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    console.error("Delete food error:", error);

    return NextResponse.json(
      { message: "Unable to delete food" },
      { status: 500 }
    );
  }
}