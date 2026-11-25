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
        { message: "Delivery partner access denied." },
        { status: 403 }
      );
    }

    const partner = await prisma.deliveryPartner.findUnique({
      where: { userId: user.id },
      include: {
        assignments: {
          include: {
            order: {
              select: {
                id: true,
                orderId: true,
                name: true,
                phone: true,
                address: true,
                city: true,
                pincode: true,
                total: true,
                status: true,
                createdAt: true,
                items: true,
              },
            },
          },
        },
      },
    });

    if (!partner || partner.status !== "APPROVED") {
      return NextResponse.json(
        { message: "Your delivery partner account is not approved." },
        { status: 403 }
      );
    }

    const assignments = partner.assignments;

    const statistics = {
      total: assignments.length,
      assigned: assignments.filter(
        (item) => item.status === "ASSIGNED"
      ).length,
      pickedUp: assignments.filter(
        (item) => item.status === "PICKED_UP"
      ).length,
      delivered: assignments.filter(
        (item) => item.status === "DELIVERED"
      ).length,
    };

    return NextResponse.json(
      {
        success: true,
        partner: {
          id: partner.id,
          phone: partner.phone,
          vehicleType: partner.vehicleType,
          vehicleNumber: partner.vehicleNumber,
          status: partner.status,
          isAvailable: partner.isAvailable,
        },
        statistics,
        assignments: assignments.map((assignment) => ({
          id: assignment.id,
          status: assignment.status,
          order: {
            ...assignment.order,
            total: Number(assignment.order.total),
          },
        })),
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Delivery dashboard error:", error);

    return NextResponse.json(
      { message: "Unable to load delivery dashboard." },
      { status: 500 }
    );
  }
}
