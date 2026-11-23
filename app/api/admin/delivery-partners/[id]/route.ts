import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: Context
) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.DELIVERY_PARTNERS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const partner = await prisma.deliveryPartner.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json(
        { message: "Delivery partner not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      partner: {
        ...partner,
        totalAssignments: partner._count.assignments,
      },
    });
  } catch (error) {
    console.error("Delivery partner details error:", error);

    return NextResponse.json(
      { message: "Unable to fetch delivery partner details." },
      { status: 500 }
    );
  }
}