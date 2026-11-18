import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const { orderId } = await params;

    const order = await prisma.order.findFirst({
      where: {
        orderId,
        userId: user.id,
      },
      include: {
        items: true,
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
    console.error("Order details error:", error);

    return NextResponse.json(
      { message: "Unable to fetch order details." },
      { status: 500 }
    );
  }
}