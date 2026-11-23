import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
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

    const result = await prisma.order.updateMany({
      where: {
        id,
        userId: user.id,
        status: "Pending",
      },
      data: {
        status: "Cancelled",
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Order not found or cannot be cancelled." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully.",
    });
  } catch (error) {
    console.error("Order cancellation error:", error);

    return NextResponse.json(
      { message: "Unable to cancel order." },
      { status: 500 }
    );
  }
}