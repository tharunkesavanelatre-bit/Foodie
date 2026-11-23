import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedUser } from "@/lib/authorization";
import { ROLES } from "@/lib/roles";

// GET - View delivery partner profile
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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json(
        { message: "Delivery partner profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      partner,
    });
  } catch (error) {
    console.error("Delivery profile error:", error);

    return NextResponse.json(
      { message: "Unable to fetch delivery profile." },
      { status: 500 }
    );
  }
}

// PATCH - Update delivery partner profile
export async function PATCH(request: NextRequest) {
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
    });

    if (!partner || partner.status !== "APPROVED") {
      return NextResponse.json(
        { message: "Approved delivery partner not found." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const data: {
      phone?: string;
      vehicleType?: string;
      vehicleNumber?: string;
    } = {};

    for (const field of [
      "phone",
      "vehicleType",
      "vehicleNumber",
    ] as const) {
      if (body[field] !== undefined) {
        if (
          typeof body[field] !== "string" ||
          !body[field].trim()
        ) {
          return NextResponse.json(
            { message: `Invalid ${field}.` },
            { status: 400 }
          );
        }

        data[field] = body[field].trim();
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "No changes provided." },
        { status: 400 }
      );
    }

    const updatedPartner = await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Delivery profile updated successfully.",
      partner: updatedPartner,
    });
  } catch (error) {
    console.error("Delivery profile update error:", error);

    return NextResponse.json(
      { message: "Unable to update delivery profile." },
      { status: 500 }
    );
  }
}