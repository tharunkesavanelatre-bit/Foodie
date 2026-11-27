import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Display approved and open restaurants to customers
export async function GET() {
  await connection();

  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        status: "APPROVED",
        isOpen: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        pincode: true,
        isOpen: true,

        // Restaurant location coordinates
        latitude: true,
        longitude: true,

        _count: {
          select: {
            foods: {
              where: {
                isAvailable: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        total: restaurants.length,
        restaurants,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public restaurants error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch restaurants.",
      },
      { status: 500 }
    );
  }
}
