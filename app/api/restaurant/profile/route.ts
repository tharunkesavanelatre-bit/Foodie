import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/roles";

function validateCoordinates(latitude: unknown, longitude: unknown) {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return false;
  }

  return true;
}

// GET - Retrieve logged-in owner's restaurant profile
export async function GET(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        ownerId: user.id,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant profile not found. Register your restaurant.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Restaurant profile GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load restaurant profile." },
      { status: 500 }
    );
  }
}

// POST - Register a new restaurant
export async function POST(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    if (user.role !== ROLES.CUSTOMER) {
      return NextResponse.json(
        {
          success: false,
          message: "Only customer accounts can submit a new restaurant application.",
        },
        { status: 403 }
      );
    }

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: {
        ownerId: user.id,
      },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already submitted a restaurant application.",
          restaurant: existingRestaurant,
        },
        { status: 409 }
      );
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const address =
      typeof body.address === "string" ? body.address.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const pincode =
      typeof body.pincode === "string" ? body.pincode.trim() : "";

    if (
      !name ||
      !description ||
      !phone ||
      !email ||
      !address ||
      !city ||
      !pincode
    ) {
      return NextResponse.json(
        { success: false, message: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (
      !validateCoordinates(body.latitude, body.longitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please capture a valid restaurant GPS location before submitting.",
        },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: user.id,
        name,
        description,
        phone,
        email,
        address,
        city,
        pincode,
        latitude: body.latitude,
        longitude: body.longitude,
        status: "PENDING",
        isOpen: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Restaurant application submitted successfully. Waiting for admin approval.",
        restaurant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Restaurant registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit restaurant application.",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update restaurant profile or availability
export async function PATCH(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    if (user.role !== ROLES.RESTAURANT) {
      return NextResponse.json(
        {
          success: false,
          message: "Only approved restaurant owners can update their profile.",
        },
        { status: 403 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        ownerId: user.id,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, message: "Restaurant profile not found." },
        { status: 404 }
      );
    }

    if (restaurant.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          message: "Your restaurant must be approved before making updates.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const data: {
      name?: string;
      description?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
      pincode?: string;
      latitude?: number;
      longitude?: number;
      isOpen?: boolean;
    } = {};

    if (body.isOpen !== undefined) {
      if (typeof body.isOpen !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Invalid restaurant availability." },
          { status: 400 }
        );
      }

      data.isOpen = body.isOpen;
    }

    const fields = [
      "name",
      "description",
      "phone",
      "email",
      "address",
      "city",
      "pincode",
    ] as const;

    for (const field of fields) {
      if (body[field] !== undefined) {
        if (
          typeof body[field] !== "string" ||
          !body[field].trim()
        ) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid ${field} value.`,
            },
            { status: 400 }
          );
        }

        data[field] = body[field].trim();
      }
    }

    if (body.latitude !== undefined || body.longitude !== undefined) {
      const latitude = body.latitude ?? restaurant.latitude;
      const longitude = body.longitude ?? restaurant.longitude;

      if (!validateCoordinates(latitude, longitude)) {
        return NextResponse.json(
          {
            success: false,
            message: "Both valid latitude and longitude are required.",
          },
          { status: 400 }
        );
      }

      data.latitude = latitude;
      data.longitude = longitude;
    }

    if (
      body.email !== undefined &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email!)
    ) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid changes provided." },
        { status: 400 }
      );
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: {
        id: restaurant.id,
      },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Restaurant profile updated successfully.",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Restaurant profile PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update restaurant profile.",
      },
      { status: 500 }
    );
  }
}
