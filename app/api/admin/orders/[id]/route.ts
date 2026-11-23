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
      PERMISSIONS.ORDERS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        assignment: {
          include: {
            deliveryPartner: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        delivery: Number(order.delivery),
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      },
    });
  } catch (error) {
    console.error("Admin order details error:", error);

    return NextResponse.json(
      { message: "Unable to fetch order details." },
      { status: 500 }
    );
  }
}