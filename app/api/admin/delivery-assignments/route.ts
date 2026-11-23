import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";

// GET - View unassigned orders and available partners
export async function GET(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.DELIVERY_PARTNERS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied." },
        { status: 403 }
      );
    }

    const [orders, partners] = await Promise.all([
      prisma.order.findMany({
        where: {
          restaurantId: { not: null },
          assignment: null,
          status: { notIn: ["Delivered", "Cancelled"] },
        },
        include: {
          items: true,
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),

      prisma.deliveryPartner.findMany({
        where: {
          status: "APPROVED",
          isAvailable: true,
        },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      partners,
    });
  } catch (error) {
    console.error("Delivery assignment fetch error:", error);

    return NextResponse.json(
      { message: "Unable to fetch delivery assignments." },
      { status: 500 }
    );
  }
}

// POST - Assign a delivery partner
export async function POST(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.DELIVERY_PARTNERS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const orderId = String(body.orderId || "");
    const deliveryPartnerId = String(body.deliveryPartnerId || "");

    if (!orderId || !deliveryPartnerId) {
      return NextResponse.json(
        { message: "Order and delivery partner are required." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { assignment: true },
      });

      if (!order || !order.restaurantId) {
        throw new Error("Restaurant order not found.");
      }

      if (
        order.status === "Delivered" ||
        order.status === "Cancelled" ||
        order.assignment
      ) {
        throw new Error("This order cannot be assigned.");
      }

      const partner = await tx.deliveryPartner.findUnique({
        where: { id: deliveryPartnerId },
      });

      if (
        !partner ||
        partner.status !== "APPROVED" ||
        !partner.isAvailable
      ) {
        throw new Error("Delivery partner is unavailable.");
      }

      const assignment = await tx.deliveryAssignment.create({
        data: {
          orderId,
          deliveryPartnerId,
          status: "ASSIGNED",
        },
      });

      await tx.deliveryPartner.update({
        where: { id: deliveryPartnerId },
        data: { isAvailable: false },
      });

      return assignment;
    });

    return NextResponse.json({
      success: true,
      message: "Delivery partner assigned successfully.",
      assignment: result,
    });
  } catch (error) {
    console.error("Delivery assignment error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to assign delivery partner.";

    const status = [
      "Restaurant order not found.",
      "This order cannot be assigned.",
      "Delivery partner is unavailable.",
    ].includes(message) ? 400 : 500;

    return NextResponse.json({ message }, { status });
  }
}