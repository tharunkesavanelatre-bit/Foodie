import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const orderStatuses = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Rejected",
];

export async function GET(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    if (user.role !== "RESTAURANT") {
      return NextResponse.json(
        { message: "Restaurant access required." },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
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
    console.error("Restaurant orders error:", error);

    return NextResponse.json(
      { message: "Unable to fetch orders." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    if (user.role !== "RESTAURANT") {
      return NextResponse.json(
        { message: "Restaurant access required." },
        { status: 403 }
      );
    }

    const { orderId, status } = await request.json();

    if (
      typeof orderId !== "string" ||
      typeof status !== "string" ||
      !orderStatuses.includes(status)
    ) {
      return NextResponse.json(
        { message: "Invalid order ID or status." },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { orderId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Order status update error:", error);

    return NextResponse.json(
      { message: "Unable to update order status." },
      { status: 500 }
    );
  }
}
