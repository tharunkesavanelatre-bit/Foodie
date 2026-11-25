import { NextRequest, NextResponse, connection } from "next/server";
import { getAdminWithPermission } from "@/lib/admin-permission";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/permissions";
import { UserRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const admin = await getAdminWithPermission(
      request,
      PERMISSIONS.DASHBOARD
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access denied." },
        { status: 403 }
      );
    }

    const permissions =
      admin.role === "ADMIN"
        ? Object.values(PERMISSIONS)
        : ROLE_PERMISSIONS[admin.role as UserRole] ?? [];

    const canViewCustomers = permissions.includes(PERMISSIONS.CUSTOMERS);
    const canManageOrders = permissions.includes(PERMISSIONS.ORDERS);
    const canManagePayments = permissions.includes(PERMISSIONS.PAYMENTS);

    const [
      users,
      orders,
      pendingOrders,
      revenue,
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      collectedAmount,
    ] = await Promise.all([
      canViewCustomers ? prisma.user.count() : 0,

      canManageOrders ? prisma.order.count() : 0,

      canManageOrders
        ? prisma.order.count({ where: { status: "Pending" } })
        : 0,

      canManagePayments
        ? prisma.order.aggregate({ _sum: { total: true } })
        : null,

      canManagePayments ? prisma.payment.count() : 0,

      canManagePayments
        ? prisma.payment.count({ where: { status: "PAID" } })
        : 0,

      canManagePayments
        ? prisma.payment.count({ where: { status: "PENDING" } })
        : 0,

      canManagePayments
        ? prisma.payment.count({ where: { status: "FAILED" } })
        : 0,

      canManagePayments
        ? prisma.payment.aggregate({
            where: { status: "PAID" },
            _sum: { amount: true },
          })
        : null,
    ]);

    return NextResponse.json({
      success: true,

      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },

      permissions,

      statistics: {
        users,
        orders,
        pendingOrders,
        revenue: Number(revenue?._sum.total || 0),
        totalPayments,
        successfulPayments,
        pendingPayments,
        failedPayments,
        collectedAmount: Number(collectedAmount?._sum.amount || 0),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      { message: "Unable to load dashboard." },
      { status: 500 }
    );
  }
}
