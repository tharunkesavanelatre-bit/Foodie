import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedUser } from "@/lib/authorization";
import { ROLES } from "@/lib/roles";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  await connection();

  try {
    const user = await getAuthorizedUser(
      request,
      [ROLES.DELIVERY_PARTNER]
    );

    if (!user) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const status = body.status;

    if (!["PICKED_UP", "DELIVERED"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid delivery status." },
        { status: 400 }
      );
    }

    const partner = await prisma.deliveryPartner.findUnique({
      where: { userId: user.id },
    });

    if (!partner || partner.status !== "APPROVED") {
      return NextResponse.json(
        { message: "Approved delivery partner not found." },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.deliveryAssignment.findFirst({
        where: {
          id,
          deliveryPartnerId: partner.id,
        },
      });

      if (!assignment) {
        throw new Error("Assignment not found.");
      }

      const validTransition =
        (assignment.status === "ASSIGNED" &&
          status === "PICKED_UP") ||
        (assignment.status === "PICKED_UP" &&
          status === "DELIVERED");

      if (!validTransition) {
        throw new Error("Invalid status transition.");
      }

      const updated = await tx.deliveryAssignment.update({
        where: { id },
        data: {
          status,
          ...(status === "PICKED_UP"
            ? { pickedUpAt: new Date() }
            : { deliveredAt: new Date() }),
        },
      });

      await tx.order.update({
        where: { id: assignment.orderId },
        data: {
          status: status === "PICKED_UP" ? "Shipped" : "Delivered",
        },
      });

      if (status === "DELIVERED") {
        await tx.deliveryPartner.update({
          where: { id: partner.id },
          data: { isAvailable: true },
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Delivery status updated successfully.",
      assignment: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update delivery status.";

    const statusCode =
      message === "Assignment not found." ||
      message === "Invalid status transition."
        ? 400
        : 500;

    return NextResponse.json(
      { message },
      { status: statusCode }
    );
  }
}