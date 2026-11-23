import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: Context
) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Customer access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        OR: [{ id }, { orderId: id }],
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