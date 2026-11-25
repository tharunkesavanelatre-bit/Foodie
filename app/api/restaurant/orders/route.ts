import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedUser } from "@/lib/authorization";
import { ROLES } from "@/lib/roles";

// GET - View restaurant orders
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

    const orders = await prisma.order.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        items: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        assignment: {
          include: {
            deliveryPartner: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal),
        delivery: Number(order.delivery),
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      })),
    });
  } catch (error) {
    console.error("Restaurant orders error:", error);

    return NextResponse.json(
      { message: "Unable to fetch restaurant orders." },
      { status: 500 }
    );
  }
}

// PATCH - Accept or reject an order
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

    const orderId =
      typeof body.orderId === "string" ? body.orderId : "";

    const status =
      typeof body.status === "string" ? body.status : "";

    if (!orderId || !["Processing", "Cancelled"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid order ID or status." },
        { status: 400 }
      );
    }

    const result = await prisma.order.updateMany({
      where: {
        id: orderId,
        restaurantId: restaurant.id,
        status: "Pending",
      },
      data: { status },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Pending order not found or already updated." },
        { status: 409 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    return NextResponse.json({
      success: true,
      message:
        status === "Processing"
          ? "Order accepted successfully."
          : "Order rejected successfully.",
      order,
    });
  } catch (error) {
    console.error("Restaurant order update error:", error);

    return NextResponse.json(
      { message: "Unable to update order." },
      { status: 500 }
    );
  }
}

