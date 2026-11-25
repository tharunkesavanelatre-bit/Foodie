import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Fetch customer addresses
export async function GET(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { success: false, message: "Customer access denied." },
        { status: 403 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Customer addresses error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch addresses." },
      { status: 500 }
    );
  }
}

// POST - Add a customer address
export async function POST(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { success: false, message: "Customer access denied." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredFields) {
      if (
        typeof body[field] !== "string" ||
        !body[field].trim()
      ) {
        return NextResponse.json(
          { success: false, message: `${field} is required.` },
          { status: 400 }
        );
      }
    }

    const latitude = body.latitude ?? null;
    const longitude = body.longitude ?? null;

    if (
      (latitude !== null &&
        (typeof latitude !== "number" ||
          !Number.isFinite(latitude) ||
          latitude < -90 ||
          latitude > 90)) ||
      (longitude !== null &&
        (typeof longitude !== "number" ||
          !Number.isFinite(longitude) ||
          longitude < -180 ||
          longitude > 180))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid location coordinates." },
        { status: 400 }
      );
    }

    const address = await prisma.$transaction(async (tx) => {
      const isFirstAddress =
        (await tx.address.count({
          where: { userId: user.id },
        })) === 0;

      const isDefault = isFirstAddress || body.isDefault === true;

      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId: user.id,
          label:
            typeof body.label === "string" && body.label.trim()
              ? body.label.trim()
              : "Home",
          fullName: body.fullName.trim(),
          phone: body.phone.trim(),
          addressLine1: body.addressLine1.trim(),
          addressLine2:
            typeof body.addressLine2 === "string"
              ? body.addressLine2.trim() || null
              : null,
          landmark:
            typeof body.landmark === "string"
              ? body.landmark.trim() || null
              : null,
          city: body.city.trim(),
          state: body.state.trim(),
          pincode: body.pincode.trim(),
          latitude,
          longitude,
          isDefault,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Address saved successfully.",
        address,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer address creation error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save address." },
      { status: 500 }
    );
  }
}
