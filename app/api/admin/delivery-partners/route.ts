import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";

// GET - View delivery partner applications
export async function GET(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.DELIVERY_PARTNERS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied." },
        { status: 403 }
      );
    }

    const partners = await prisma.deliveryPartner.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      partners,
    });
  } catch (error) {
    console.error("Fetch delivery partners error:", error);

    return NextResponse.json(
      { message: "Unable to fetch delivery partners." },
      { status: 500 }
    );
  }
}

// PATCH - Approve or reject an application
export async function PATCH(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.DELIVERY_PARTNERS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";

    if (!id || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid partner ID or status." },
        { status: 400 }
      );
    }

    const partner = await prisma.deliveryPartner.findUnique({
      where: { id },
    });

    if (!partner) {
      return NextResponse.json(
        { message: "Delivery partner application not found." },
        { status: 404 }
      );
    }

    if (partner.status !== "PENDING") {
      return NextResponse.json(
        { message: "This application has already been reviewed." },
        { status: 400 }
      );
    }

    const updatedPartner = await prisma.$transaction(async (tx) => {
      const updated = await tx.deliveryPartner.update({
        where: { id },
        data: {
          status,
          isAvailable: false,
        },
      });

      if (status === "APPROVED") {
        await tx.user.update({
          where: { id: partner.userId },
          data: { role: "DELIVERY_PARTNER" },
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message:
        status === "APPROVED"
          ? "Delivery partner approved successfully."
          : "Delivery partner application rejected.",
      partner: updatedPartner,
    });
  } catch (error) {
    console.error("Delivery partner approval error:", error);

    return NextResponse.json(
      { message: "Unable to update delivery partner application." },
      { status: 500 }
    );
  }
}