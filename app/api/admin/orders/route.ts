import { NextRequest, NextResponse, connection } from "next/server";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

// GET - Fetch all orders
export async function GET(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.ORDERS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied." },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        items: true,
        paymentRecord: true,
        assignment: {
          include: {
            deliveryPartner: {
              include: {
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
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

        paymentRecord: order.paymentRecord
          ? {
              ...order.paymentRecord,
              amount: Number(order.paymentRecord.amount),
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Admin orders error:", error);

    return NextResponse.json(
      { message: "Unable to fetch orders." },
      { status: 500 }
    );
  }
}

// PATCH - Update order status
export async function PATCH(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.ORDERS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const orderId = String(body.orderId || "");
    const status = String(body.status || "");

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!orderId || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid order ID or status." },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        paymentRecord: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        delivery: Number(order.delivery),
        total: Number(order.total),
        paymentRecord: order.paymentRecord
          ? {
              ...order.paymentRecord,
              amount: Number(order.paymentRecord.amount),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Update order error:", error);

    return NextResponse.json(
      { message: "Unable to update order status." },
      { status: 500 }
    );
  }
}