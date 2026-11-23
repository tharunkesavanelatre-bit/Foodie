import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";

// GET - Fetch all payments
export async function GET(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.PAYMENTS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const payments = await prisma.payment.findMany({
      include: {
        order: {
          select: {
            id: true,
            orderId: true,
            status: true,
            total: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                email: true,
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
      payments: payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
        order: {
          ...payment.order,
          total: Number(payment.order.total),
        },
      })),
    });
  } catch (error) {
    console.error("Admin payments error:", error);

    return NextResponse.json(
      { message: "Unable to fetch payments." },
      { status: 500 }
    );
  }
}

// PATCH - Update payment
export async function PATCH(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.PAYMENTS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { id, status, transactionId } = body;

    const allowedStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
    ];

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { message: "Valid payment ID is required." },
        { status: 400 }
      );
    }

    if (
      status === undefined &&
      transactionId === undefined
    ) {
      return NextResponse.json(
        { message: "No payment changes provided." },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      (typeof status !== "string" ||
        !allowedStatuses.includes(status))
    ) {
      return NextResponse.json(
        { message: "Invalid payment status." },
        { status: 400 }
      );
    }

    if (
      transactionId !== undefined &&
      transactionId !== null &&
      (typeof transactionId !== "string" ||
        transactionId.length > 200)
    ) {
      return NextResponse.json(
        { message: "Invalid transaction ID." },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found." },
        { status: 404 }
      );
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        ...(status !== undefined && {
          status,
          ...(status === "PAID" && {
            paidAt: payment.paidAt ?? new Date(),
          }),
        }),

        ...(transactionId !== undefined && {
          transactionId:
            typeof transactionId === "string" &&
            transactionId.trim()
              ? transactionId.trim()
              : null,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment updated successfully.",
      payment: {
        ...updatedPayment,
        amount: Number(updatedPayment.amount),
      },
    });
  } catch (error) {
    console.error("Payment update error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "This transaction ID is already in use." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unable to update payment." },
      { status: 500 }
    );
  }
}