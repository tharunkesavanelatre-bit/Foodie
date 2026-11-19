import { NextRequest, NextResponse, connection } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// GET – Fetch all customer orders
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

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
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
    console.error("Admin orders error:", error);

    return NextResponse.json(
      { message: "Unable to fetch orders" },
      { status: 500 }
    );
  }
}

// PATCH – Update order status
export async function PATCH(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const orderId =
      typeof body.orderId === "string" ? body.orderId : "";

    const status =
      typeof body.status === "string" ? body.status : "";

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!orderId || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid order ID or status" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);

    return NextResponse.json(
      { message: "Unable to update order status" },
      { status: 500 }
    );
  }
}