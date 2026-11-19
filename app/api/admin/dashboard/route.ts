import { NextRequest, NextResponse, connection } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied" },
        { status: 403 }
      );
    }

    const [users, orders, pendingOrders, revenue] =
      await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.count({
          where: { status: "Pending" },
        }),
        prisma.order.aggregate({
          _sum: { total: true },
        }),
      ]);

    return NextResponse.json({
      success: true,
      admin: {
        name: admin.name,
        email: admin.email,
      },
      statistics: {
        users,
        orders,
        pendingOrders,
        revenue: Number(revenue._sum.total || 0),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      { message: "Unable to load dashboard" },
      { status: 500 }
    );
  }
}