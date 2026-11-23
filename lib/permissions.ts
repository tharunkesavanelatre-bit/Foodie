import { ROLES, UserRole } from "@/lib/roles";

export const PERMISSIONS = {
  DASHBOARD: "dashboard:view",
  ORDERS: "orders:manage",
  FOODS: "foods:manage",
  RESTAURANTS: "restaurants:manage",
  CUSTOMERS: "customers:manage",
  PAYMENTS: "payments:manage",
  COUPONS: "coupons:manage",
  ADMINS: "admins:manage",
  DELIVERY_PARTNERS: "delivery-partners:manage",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Partial<
  Record<UserRole, readonly Permission[]>
> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.OPS_ADMIN]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.ORDERS,
    PERMISSIONS.FOODS,
    PERMISSIONS.RESTAURANTS,
    PERMISSIONS.DELIVERY_PARTNERS,
  ],

  [ROLES.SUPPORT_ADMIN]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.ORDERS,
    PERMISSIONS.CUSTOMERS,
  ],

  [ROLES.FINANCE_ADMIN]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.PAYMENTS,
  ],

  [ROLES.MARKETING_ADMIN]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.COUPONS,
  ],
};

export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}