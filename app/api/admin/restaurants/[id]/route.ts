import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: Context
) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.RESTAURANTS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            foods: true,
            orders: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      restaurant: {
        ...restaurant,
        totalFoods: restaurant._count.foods,
        totalOrders: restaurant._count.orders,
      },
    });
  } catch (error) {
    console.error("Restaurant details error:", error);

    return NextResponse.json(
      { message: "Unable to fetch restaurant details." },
      { status: 500 }
    );
  }
}