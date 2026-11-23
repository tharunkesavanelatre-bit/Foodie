import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please log in to apply a coupon." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal);

    if (!code || !Number.isFinite(subtotal) || subtotal <= 0) {
      return NextResponse.json(
        { message: "Enter a valid coupon code." },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { message: "This coupon is invalid or inactive." },
        { status: 404 }
      );
    }

    const now = new Date();

    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json(
        { message: "This coupon is not active yet." },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json(
        { message: "This coupon has expired." },
        { status: 400 }
      );
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usageCount >= coupon.usageLimit
    ) {
      return NextResponse.json(
        { message: "This coupon has reached its usage limit." },
        { status: 400 }
      );
    }

    const minimum = Number(coupon.minOrderAmount);

    if (subtotal < minimum) {
      return NextResponse.json(
        {
          message: `Minimum order amount for this coupon is ₹${minimum.toFixed(2)}.`,
        },
        { status: 400 }
      );
    }

    let discount =
      coupon.discountType === "PERCENTAGE"
        ? (subtotal * Number(coupon.discountValue)) / 100
        : Number(coupon.discountValue);

    if (coupon.maxDiscount !== null) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }

    discount = Math.min(subtotal, Math.round(discount * 100) / 100);

    return NextResponse.json({
      message: "Coupon applied successfully!",
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);

    return NextResponse.json(
      { message: "Unable to validate coupon." },
      { status: 500 }
    );
  }
}