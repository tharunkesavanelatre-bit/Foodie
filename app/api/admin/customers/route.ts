import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";

// GET - View all customers
export async function GET(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.CUSTOMERS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      customers: customers.map((customer) => ({
        ...customer,
        totalOrders: customer._count.orders,
      })),
    });
  } catch (error) {
    console.error("Admin customers error:", error);

    return NextResponse.json(
      { message: "Unable to fetch customers." },
      { status: 500 }
    );
  }
}