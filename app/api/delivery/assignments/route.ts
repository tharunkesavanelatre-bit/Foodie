import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedUser } from "@/lib/authorization";
import { ROLES } from "@/lib/roles";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const user = await getAuthorizedUser(request, [
      ROLES.DELIVERY_PARTNER,
    ]);

    if (!user) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
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

    const assignments = await prisma.deliveryAssignment.findMany({
      where: {
        deliveryPartnerId: partner.id,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      assignments: assignments.map((assignment) => ({
        ...assignment,
        order: {
          ...assignment.order,
          subtotal: Number(assignment.order.subtotal),
          delivery: Number(assignment.order.delivery),
          total: Number(assignment.order.total),
          items: assignment.order.items.map((item) => ({
            ...item,
            price: Number(item.price),
          })),
        },
      })),
    });
  } catch (error) {
    console.error("Delivery assignments error:", error);

    return NextResponse.json(
      { message: "Unable to fetch assignments." },
      { status: 500 }
    );
  }
}