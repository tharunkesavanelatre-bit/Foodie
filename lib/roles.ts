// FOODDIE USER ROLES

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  RESTAURANT: "RESTAURANT",
  DELIVERY_PARTNER: "DELIVERY_PARTNER",

  SUPER_ADMIN: "SUPER_ADMIN",
  OPS_ADMIN: "OPS_ADMIN",
  SUPPORT_ADMIN: "SUPPORT_ADMIN",
  FINANCE_ADMIN: "FINANCE_ADMIN",
  MARKETING_ADMIN: "MARKETING_ADMIN",

  // Temporary support for existing Admin accounts
  ADMIN: "ADMIN",
} as const;

// Type for all supported roles
export type UserRole =
  (typeof ROLES)[keyof typeof ROLES];

// Admin roles
export const ADMIN_ROLES: readonly UserRole[] = [
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
  ROLES.OPS_ADMIN,
  ROLES.SUPPORT_ADMIN,
  ROLES.FINANCE_ADMIN,
  ROLES.MARKETING_ADMIN,
];

// Check whether a user has an admin role
export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as UserRole);
}

// Check whether a user has an allowed role
export function hasRole(
  role: string,
  allowedRoles: readonly UserRole[]
): boolean {
  return allowedRoles.includes(role as UserRole);
}