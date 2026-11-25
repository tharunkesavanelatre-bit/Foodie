import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedUser } from "@/lib/authorization";
import { ROLES } from "@/lib/roles";

// GET - Restaurant dashboard
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

    if (!restaurant || restaurant.status !== "APPROVED") {
      return NextResponse.json(
        { message: "Approved restaurant not found." },
        { status: 403 }
      );
    }

    const orderFilter = {
      restaurantId: restaurant.id,
    };

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      revenue,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: orderFilter,
      }),

      prisma.order.count({
        where: { ...orderFilter, status: "Pending" },
      }),

      prisma.order.count({
        where: { ...orderFilter, status: "Processing" },
      }),

      prisma.order.count({
        where: { ...orderFilter, status: "Delivered" },
      }),

      prisma.order.count({
        where: { ...orderFilter, status: "Cancelled" },
      }),

      prisma.order.aggregate({
        where: {
          ...orderFilter,
          status: "Delivered",
        },
        _sum: {
          total: true,
        },
      }),

      prisma.order.findMany({
        where: orderFilter,
        include: {
          items: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      success: true,

      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        status: restaurant.status,
        isOpen: restaurant.isOpen,
      },

      statistics: {
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: Number(revenue._sum.total ?? 0),
      },

      recentOrders: recentOrders.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal),
        delivery: Number(order.delivery),
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      })),
    });
  } catch (error) {
    console.error("Restaurant dashboard error:", error);

    return NextResponse.json(
      { message: "Unable to load restaurant dashboard." },
      { status: 500 }
    );
  }
}

