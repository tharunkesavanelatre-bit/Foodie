import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  await connection();

  try {
    const { id } = await params;

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id,
        status: "APPROVED",
        isOpen: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        phone: true,
        address: true,
        city: true,
        pincode: true,
        isOpen: true,
        foods: {
          where: {
            isAvailable: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            image: true,
            price: true,
            isAvailable: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found or currently unavailable.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        restaurant,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public restaurant menu error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch restaurant menu.",
      },
      { status: 500 }
    );
  }
}