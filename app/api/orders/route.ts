import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Customer access denied." },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: true,
        paymentRecord: true,
        assignment: {
          include: {
            deliveryPartner: {
              select: {
                phone: true,
                vehicleType: true,
                vehicleNumber: true,
              },
            },
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
        deliveryFee: Number(order.delivery),
        discount: Number(order.discount ?? 0),
        couponCode: order.couponCode,
        total: Number(order.total),

        paymentRecord: order.paymentRecord
          ? {
              ...order.paymentRecord,
              amount: Number(order.paymentRecord.amount),
            }
          : null,

        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      })),
    });
  } catch (error) {
    console.error("Customer orders error:", error);

    return NextResponse.json(
      { message: "Unable to fetch orders." },
      { status: 500 }
    );
  }
}