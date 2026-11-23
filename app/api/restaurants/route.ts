import { NextRequest, NextResponse, connection } from "next/server";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

// GET - View restaurants
export async function GET(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.RESTAURANTS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied." },
        { status: 403 }
      );
    }

    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
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
      restaurants,
    });
  } catch (error) {
    console.error("Fetch restaurants error:", error);

    return NextResponse.json(
      { message: "Unable to fetch restaurants." },
      { status: 500 }
    );
  }
}

// PATCH - Approve or reject restaurant
export async function PATCH(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.RESTAURANTS
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
        { message: "Invalid restaurant ID or status." },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found." },
        { status: 404 }
      );
    }

    if (restaurant.status !== "PENDING") {
      return NextResponse.json(
        { message: "This application has already been reviewed." },
        { status: 400 }
      );
    }

    const updatedRestaurant = await prisma.$transaction(async (tx) => {
      const updated = await tx.restaurant.update({
        where: { id },
        data: {
          status,
          isOpen: false,
        },
      });

      if (status === "APPROVED") {
        await tx.user.update({
          where: { id: restaurant.ownerId },
          data: { role: "RESTAURANT" },
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message:
        status === "APPROVED"
          ? "Restaurant approved successfully. Owner can access the restaurant portal."
          : "Restaurant application rejected successfully.",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Restaurant approval error:", error);

    return NextResponse.json(
      { message: "Unable to update restaurant status." },
      { status: 500 }
    );
  }
}