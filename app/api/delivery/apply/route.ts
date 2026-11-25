import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    if (user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Only customer accounts can apply." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const phone = String(body.phone || "").trim();
    const vehicleType = String(body.vehicleType || "").trim();
    const vehicleNumber = String(body.vehicleNumber || "")
      .trim()
      .toUpperCase();

    if (!phone || !vehicleType || !vehicleNumber) {
      return NextResponse.json(
        { message: "Please complete all application fields." },
        { status: 400 }
      );
    }

    if (
      phone.length < 10 ||
      phone.length > 15 ||
      !/^[0-9+\-\s]+$/.test(phone)
    ) {
      return NextResponse.json(
        { message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    if (vehicleType.length > 50 || vehicleNumber.length > 30) {
      return NextResponse.json(
        { message: "Vehicle details are too long." },
        { status: 400 }
      );
    }

    const existingApplication = await prisma.deliveryPartner.findUnique({
      where: { userId: user.id },
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: "You have already submitted a delivery partner application." },
        { status: 409 }
      );
    }

    const application = await prisma.deliveryPartner.create({
      data: {
        userId: user.id,
        phone,
        vehicleType,
        vehicleNumber,
        status: "PENDING",
        isAvailable: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Delivery partner application submitted successfully.",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Delivery application error:", error);

    return NextResponse.json(
      { message: "Unable to submit application." },
      { status: 500 }
    );
  }
}
