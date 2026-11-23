import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedUser } from "@/lib/authorization";
import { ROLES } from "@/lib/roles";

// GET - View restaurant profile
export async function GET(request: NextRequest) {
  await connection();

  try {
    const user = await getAuthorizedUser(request, [ROLES.RESTAURANT]);

    if (!user) {
      return NextResponse.json(
        { message: "Restaurant access denied." },
        { status: 403 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: user.id },
    });

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Restaurant profile error:", error);

    return NextResponse.json(
      { message: "Unable to fetch restaurant profile." },
      { status: 500 }
    );
  }
}

// POST - Register a new restaurant
export async function POST(request: NextRequest) {
  await connection();

  try {
    const user = await getAuthorizedUser(request, [ROLES.RESTAURANT]);

    if (!user) {
      return NextResponse.json(
        { message: "Restaurant access denied." },
        { status: 403 }
      );
    }

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { ownerId: user.id },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { message: "You have already registered a restaurant." },
        { status: 409 }
      );
    }

    const body = await request.json();

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
      if (
        typeof body[field] !== "string" ||
        !body[field].trim()
      ) {
        return NextResponse.json(
          { message: `${field} is required.` },
          { status: 400 }
        );
      }
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: user.id,
        name: body.name.trim(),
        description: body.description.trim(),
        phone: body.phone.trim(),
        email: body.email.trim(),
        address: body.address.trim(),
        city: body.city.trim(),
        pincode: body.pincode.trim(),
        status: "PENDING",
        isOpen: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Restaurant registration submitted successfully. Waiting for admin approval.",
        restaurant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Restaurant registration error:", error);

    return NextResponse.json(
      { message: "Unable to register restaurant." },
      { status: 500 }
    );
  }
}

// PATCH - Update restaurant profile
export async function PATCH(request: NextRequest) {
  await connection();

  try {
    const user = await getAuthorizedUser(request, [ROLES.RESTAURANT]);

    if (!user) {
      return NextResponse.json(
        { message: "Restaurant access denied." },
        { status: 403 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: user.id },
    });

    if (!restaurant || restaurant.status !== "APPROVED") {
      return NextResponse.json(
        { message: "Approved restaurant not found." },
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
      isOpen?: boolean;
    } = {};

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
            { message: `Invalid ${field}.` },
            { status: 400 }
          );
        }

        data[field] = body[field].trim();
      }
    }

    if (body.isOpen !== undefined) {
      if (typeof body.isOpen !== "boolean") {
        return NextResponse.json(
          { message: "Invalid restaurant availability." },
          { status: 400 }
        );
      }

      data.isOpen = body.isOpen;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "No changes provided." },
        { status: 400 }
      );
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Restaurant profile updated successfully.",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Restaurant profile update error:", error);

    return NextResponse.json(
      { message: "Unable to update restaurant profile." },
      { status: 500 }
    );
  }
}
