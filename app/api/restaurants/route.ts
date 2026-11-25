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
// DELETE - Safely delete a specific restaurant
export async function DELETE(request: NextRequest) {
  await connection();

  try {
    // 1. Verify admin permission
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.RESTAURANTS
    );

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin access denied." },
        { status: 403 }
      );
    }

    // 2. Read request
    const body = await request.json();

    const id =
      typeof body.id === "string" ? body.id.trim() : "";

    const confirmEmail =
      typeof body.confirmEmail === "string"
        ? body.confirmEmail.trim().toLowerCase()
        : "";

    if (!id || !confirmEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant ID and confirmation email are required.",
        },
        { status: 400 }
      );
    }

    // 3. Find restaurant and owner
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, message: "Restaurant not found." },
        { status: 404 }
      );
    }

    // 4. Verify restaurant email
    if (
      restaurant.email?.trim().toLowerCase() !== confirmEmail ||
      confirmEmail !== "sangeetvegrestaurants@gmail.com"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant confirmation email does not match.",
        },
        { status: 400 }
      );
    }

    // 5. Delete restaurant safely using transaction
    await prisma.$transaction(async (tx) => {
      // Delete only this restaurant's menu foods.
      // CartItem.foodId becomes null because of SetNull.
      await tx.food.deleteMany({
        where: {
          restaurantId: restaurant.id,
        },
      });

      // Preserve owner account and reset restaurant role.
      if (restaurant.owner.role === "RESTAURANT") {
        await tx.user.update({
          where: {
            id: restaurant.ownerId,
          },
          data: {
            role: "CUSTOMER",
          },
        });
      }

      // Delete restaurant.
      // Historical orders remain because of SetNull.
      await tx.restaurant.delete({
        where: {
          id: restaurant.id,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `${restaurant.name} has been deleted successfully.`,
    });
  } catch (error) {
    console.error("Restaurant deletion error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete restaurant. Check the server logs.",
      },
      { status: 500 }
    );
  }
}
