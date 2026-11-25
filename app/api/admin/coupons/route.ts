import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS } from "@/lib/permissions";

const normalizeCode = (value: unknown) =>
  String(value ?? "").trim().toUpperCase();

const validDiscountType = (value: unknown) =>
  value === "PERCENTAGE" || value === "FIXED";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.COUPONS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "You are not authorized to manage coupons." },
        { status: 403 }
      );
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      coupons: coupons.map((coupon) => ({
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: Number(coupon.minOrderAmount),
        maxDiscount:
          coupon.maxDiscount === null
            ? null
            : Number(coupon.maxDiscount),
      })),
    });
  } catch (error) {
    console.error("Admin coupons GET error:", error);

    return NextResponse.json(
      { message: "Unable to fetch coupons." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.COUPONS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "You are not authorized to manage coupons." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const code = normalizeCode(body.code);
    const description = String(body.description ?? "").trim();
    const discountType = body.discountType;
    const discountValue = Number(body.discountValue);
    const minOrderAmount = Number(body.minOrderAmount ?? 0);
    const maxDiscount =
      body.maxDiscount === "" ||
      body.maxDiscount === null ||
      body.maxDiscount === undefined
        ? null
        : Number(body.maxDiscount);

    const usageLimit =
      body.usageLimit === "" ||
      body.usageLimit === null ||
      body.usageLimit === undefined
        ? null
        : Number(body.usageLimit);

    const startsAt = body.startsAt ? new Date(body.startsAt) : null;
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
      return NextResponse.json(
        { message: "Coupon code must contain 3â€“30 letters, numbers, hyphens or underscores." },
        { status: 400 }
      );
    }

    if (!validDiscountType(discountType)) {
      return NextResponse.json(
        { message: "Choose a valid discount type." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        { message: "Discount value must be greater than zero." },
        { status: 400 }
      );
    }

    if (
      discountType === "PERCENTAGE" &&
      (discountValue > 100 || discountValue > 100)
    ) {
      return NextResponse.json(
        { message: "Percentage discount cannot exceed 100%." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
      return NextResponse.json(
        { message: "Minimum order amount cannot be negative." },
        { status: 400 }
      );
    }

    if (
      maxDiscount !== null &&
      (!Number.isFinite(maxDiscount) || maxDiscount <= 0)
    ) {
      return NextResponse.json(
        { message: "Maximum discount must be greater than zero." },
        { status: 400 }
      );
    }

    if (
      usageLimit !== null &&
      (!Number.isInteger(usageLimit) || usageLimit <= 0)
    ) {
      return NextResponse.json(
        { message: "Usage limit must be a positive whole number." },
        { status: 400 }
      );
    }

    if (
      (startsAt && Number.isNaN(startsAt.getTime())) ||
      (expiresAt && Number.isNaN(expiresAt.getTime()))
    ) {
      return NextResponse.json(
        { message: "Enter valid coupon dates." },
        { status: 400 }
      );
    }

    if (startsAt && expiresAt && expiresAt <= startsAt) {
      return NextResponse.json(
        { message: "Expiry date must be later than the start date." },
        { status: 400 }
      );
    }

    if (
      discountType === "PERCENTAGE" &&
      maxDiscount !== null &&
      maxDiscount <= 0
    ) {
      return NextResponse.json(
        { message: "Maximum discount must be greater than zero." },
        { status: 400 }
      );
    }

    const existingCoupon = await prisma.coupon.findUnique({
      where: { code },
      select: { id: true },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { message: "This coupon code already exists." },
        { status: 409 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: description || null,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        startsAt,
        expiresAt,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully.",
        coupon: {
          ...coupon,
          discountValue: Number(coupon.discountValue),
          minOrderAmount: Number(coupon.minOrderAmount),
          maxDiscount:
            coupon.maxDiscount === null
              ? null
              : Number(coupon.maxDiscount),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin coupons POST error:", error);

    return NextResponse.json(
      { message: "Unable to create coupon." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.COUPONS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "You are not authorized to manage coupons." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const id = String(body.id ?? "").trim();

    if (!id) {
      return NextResponse.json(
        { message: "Coupon ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Coupon not found." },
        { status: 404 }
      );
    }

    const data: {
      code?: string;
      description?: string | null;
      discountType?: string;
      discountValue?: number;
      minOrderAmount?: number;
      maxDiscount?: number | null;
      usageLimit?: number | null;
      startsAt?: Date | null;
      expiresAt?: Date | null;
      isActive?: boolean;
    } = {};

    if (body.code !== undefined) {
      const code = normalizeCode(body.code);

      if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
        return NextResponse.json(
          { message: "Enter a valid coupon code." },
          { status: 400 }
        );
      }

      data.code = code;
    }

    if (body.description !== undefined) {
      data.description = String(body.description).trim() || null;
    }

    if (body.discountType !== undefined) {
      if (!validDiscountType(body.discountType)) {
        return NextResponse.json(
          { message: "Choose a valid discount type." },
          { status: 400 }
        );
      }

      data.discountType = body.discountType;
    }

    if (body.discountValue !== undefined) {
      const value = Number(body.discountValue);

      if (
        !Number.isFinite(value) ||
        value <= 0 ||
        ((data.discountType ?? existing.discountType) === "PERCENTAGE" &&
          value > 100)
      ) {
        return NextResponse.json(
          { message: "Enter a valid discount value." },
          { status: 400 }
        );
      }

      data.discountValue = value;
    }

    if (body.minOrderAmount !== undefined) {
      const value = Number(body.minOrderAmount);

      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json(
          { message: "Enter a valid minimum order amount." },
          { status: 400 }
        );
      }

      data.minOrderAmount = value;
    }

    if (body.maxDiscount !== undefined) {
      const value =
        body.maxDiscount === "" || body.maxDiscount === null
          ? null
          : Number(body.maxDiscount);

      if (
        value !== null &&
        (!Number.isFinite(value) || value <= 0)
      ) {
        return NextResponse.json(
          { message: "Enter a valid maximum discount." },
          { status: 400 }
        );
      }

      data.maxDiscount = value;
    }

    if (body.usageLimit !== undefined) {
      const value =
        body.usageLimit === "" || body.usageLimit === null
          ? null
          : Number(body.usageLimit);

      if (
        value !== null &&
        (!Number.isInteger(value) || value < existing.usageCount || value <= 0)
      ) {
        return NextResponse.json(
          { message: "Usage limit cannot be below the number of uses already recorded." },
          { status: 400 }
        );
      }

      data.usageLimit = value;
    }

    if (body.startsAt !== undefined) {
      const value = body.startsAt ? new Date(body.startsAt) : null;

      if (value && Number.isNaN(value.getTime())) {
        return NextResponse.json(
          { message: "Enter a valid start date." },
          { status: 400 }
        );
      }

      data.startsAt = value;
    }

    if (body.expiresAt !== undefined) {
      const value = body.expiresAt ? new Date(body.expiresAt) : null;

      if (value && Number.isNaN(value.getTime())) {
        return NextResponse.json(
          { message: "Enter a valid expiry date." },
          { status: 400 }
        );
      }

      data.expiresAt = value;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { message: "Invalid coupon status." },
          { status: 400 }
        );
      }

      data.isActive = body.isActive;
    }

    const finalDiscountType = data.discountType ?? existing.discountType;
    const finalStartsAt = data.startsAt ?? existing.startsAt;
    const finalExpiresAt = data.expiresAt ?? existing.expiresAt;

    if (
      finalStartsAt &&
      finalExpiresAt &&
      finalExpiresAt <= finalStartsAt
    ) {
      return NextResponse.json(
        { message: "Expiry date must be later than the start date." },
        { status: 400 }
      );
    }

    if (finalDiscountType === "PERCENTAGE") {
      const finalValue = data.discountValue ?? Number(existing.discountValue);

      if (finalValue > 100) {
        return NextResponse.json(
          { message: "Percentage discount cannot exceed 100%." },
          { status: 400 }
        );
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully.",
      coupon,
    });
  } catch (error) {
    console.error("Admin coupons PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update coupon." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.COUPONS
    );

    if (!admin) {
      return NextResponse.json(
        { message: "You are not authorized to manage coupons." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Coupon ID is required." },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Coupon not found." },
        { status: 404 }
      );
    }

    if (coupon._count.orders > 0) {
      return NextResponse.json(
        {
          message:
            "This coupon has been used in orders. Deactivate it instead of deleting it.",
        },
        { status: 409 }
      );
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    console.error("Admin coupons DELETE error:", error);

    return NextResponse.json(
      { message: "Unable to delete coupon." },
      { status: 500 }
    );
  }
}
