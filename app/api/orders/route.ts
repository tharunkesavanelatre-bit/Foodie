import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
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
    console.error("Orders fetch error:", error);

    return NextResponse.json(
      { message: "Unable to fetch confirmed orders." },
      { status: 500 }
    );
  }
}