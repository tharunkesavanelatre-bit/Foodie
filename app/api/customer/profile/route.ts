import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - View customer profile
export async function GET(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Customer access denied." },
        { status: 403 }
      );
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { message: "Customer profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Customer profile error:", error);

    return NextResponse.json(
      { message: "Unable to fetch customer profile." },
      { status: 500 }
    );
  }
}

// PATCH - Update customer profile
export async function PATCH(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Customer access denied." },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (typeof body.name !== "string") {
      return NextResponse.json(
        { message: "A valid name is required." },
        { status: 400 }
      );
    }

    const name = body.name.trim();

    if (!name || name.length > 80) {
      return NextResponse.json(
        { message: "Name must contain between 1 and 80 characters." },
        { status: 400 }
      );
    }

    const profile = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Customer profile update error:", error);

    return NextResponse.json(
      { message: "Unable to update customer profile." },
      { status: 500 }
    );
  }
}