import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

// PATCH - Update address or set as default
export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { success: false, message: "Customer access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Address not found." },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    const stringFields = [
      "label",
      "fullName",
      "phone",
      "addressLine1",
      "addressLine2",
      "landmark",
      "city",
      "state",
      "pincode",
    ] as const;

    for (const field of stringFields) {
      if (field in body) {
        if (
          typeof body[field] !== "string" ||
          (field !== "addressLine2" &&
            field !== "landmark" &&
            !body[field].trim())
        ) {
          return NextResponse.json(
            { success: false, message: `Invalid ${field}.` },
            { status: 400 }
          );
        }

        data[field] = body[field].trim() || null;
      }
    }

    if ("latitude" in body) {
      if (
        body.latitude !== null &&
        (typeof body.latitude !== "number" ||
          !Number.isFinite(body.latitude) ||
          body.latitude < -90 ||
          body.latitude > 90)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid latitude." },
          { status: 400 }
        );
      }

      data.latitude = body.latitude;
    }

    if ("longitude" in body) {
      if (
        body.longitude !== null &&
        (typeof body.longitude !== "number" ||
          !Number.isFinite(body.longitude) ||
          body.longitude < -180 ||
          body.longitude > 180)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid longitude." },
          { status: 400 }
        );
      }

      data.longitude = body.longitude;
    }

    if ("isDefault" in body && typeof body.isDefault !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid default address value." },
        { status: 400 }
      );
    }

    const address = await prisma.$transaction(async (tx) => {
      if (body.isDefault === true) {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });

        data.isDefault = true;
      } else if (body.isDefault === false) {
        data.isDefault = false;
      }

      return tx.address.update({
        where: { id },
        data,
      });
    });

    return NextResponse.json({
      success: true,
      message: "Address updated successfully.",
      address,
    });
  } catch (error) {
    console.error("Address update error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update address." },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer address
export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { success: false, message: "Customer access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Address not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id },
      });

      if (existing.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    console.error("Address deletion error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete address." },
      { status: 500 }
    );
  }
}