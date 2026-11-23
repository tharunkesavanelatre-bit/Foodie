import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedUser } from "@/lib/authorization";
import { ROLES } from "@/lib/roles";

// PATCH - Update delivery availability
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();

    if (typeof body.isAvailable !== "boolean") {
      return NextResponse.json(
        { message: "Invalid availability value." },
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

    if (body.isAvailable) {
      const activeAssignment = await prisma.deliveryAssignment.findFirst({
        where: {
          deliveryPartnerId: partner.id,
          status: { in: ["ASSIGNED", "PICKED_UP"] },
        },
      });

      if (activeAssignment) {
        return NextResponse.json(
          { message: "Complete your current delivery first." },
          { status: 409 }
        );
      }
    }

    const updatedPartner = await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: { isAvailable: body.isAvailable },
    });

    return NextResponse.json({
      success: true,
      message: "Availability updated successfully.",
      isAvailable: updatedPartner.isAvailable,
    });
  } catch (error) {
    console.error("Availability update error:", error);

    return NextResponse.json(
      { message: "Unable to update availability." },
      { status: 500 }
    );
  }
}