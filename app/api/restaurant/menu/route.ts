import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedUser } from "@/lib/authorization";
import { ROLES } from "@/lib/roles";

// GET - View restaurant menu
export async function GET(request: NextRequest) {
  await connection();

  try {
    const user = await getAuthorizedUser(request, [ROLES.RESTAURANT]);

    if (!user) {
      return NextResponse.json(
        { message: "Restaurant access denied." },
        { status: 403 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: user.id },
    });

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found." },
        { status: 404 }
      );
    }

    const foods = await prisma.food.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      foods: foods.map((food) => ({
        ...food,
        price: Number(food.price),
      })),
    });
  } catch (error) {
    console.error("Restaurant menu error:", error);

    return NextResponse.json(
      { message: "Unable to fetch restaurant menu." },
      { status: 500 }
    );
  }
}

// POST - Add food item
export async function POST(request: NextRequest) {
  await connection();

  try {
    const user = await getAuthorizedUser(request, [ROLES.RESTAURANT]);

    if (!user) {
      return NextResponse.json(
        { message: "Restaurant access denied." },
        { status: 403 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: user.id },
    });

    if (!restaurant || restaurant.status !== "APPROVED") {
      return NextResponse.json(
        { message: "Approved restaurant not found." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const image = typeof body.image === "string" ? body.image.trim() : "";
    const price = Number(body.price);

    if (
      !name ||
      !description ||
      !category ||
      !image ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        { message: "Please provide valid food details." },
        { status: 400 }
      );
    }

    const food = await prisma.food.create({
      data: {
        restaurantId: restaurant.id,
        name,
        description,
        category,
        image,
        price,
        isAvailable: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Food item added successfully.",
        food: {
          ...food,
          price: Number(food.price),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add restaurant food error:", error);

    return NextResponse.json(
      { message: "Unable to add food item." },
      { status: 500 }
    );
  }
}
