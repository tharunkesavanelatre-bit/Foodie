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
      PERMISSIONS.CUSTOMERS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const customer = await prisma.user.findFirst({
      where: {
        id,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        orders: {
          include: {
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
        orders: customer.orders.map((order) => ({
          ...order,
          subtotal: Number(order.subtotal),
          delivery: Number(order.delivery),
          total: Number(order.total),
          items: order.items.map((item) => ({
            ...item,
            price: Number(item.price),
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Customer details error:", error);

    return NextResponse.json(
      { message: "Unable to fetch customer details." },
      { status: 500 }
    );
  }
}