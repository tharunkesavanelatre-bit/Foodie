import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isAdminRole, UserRole } from "@/lib/roles";
import {
  hasPermission,
  Permission,
} from "@/lib/permissions";

export async function getAdminWithPermission(
  request: NextRequest,
  permission: Permission
) {
  const user = await getCurrentUser(request);

  if (!user || !isAdminRole(user.role)) {
    return null;
  }

  // Support existing Admin account
  if (user.role === "ADMIN") {
    const adminEmail = process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

    if (
      !adminEmail ||
      user.email.trim().toLowerCase() !== adminEmail
    ) {
      return null;
    }

    return user;
  }

  // Check role-based permission
  if (!hasPermission(user.role as UserRole, permission)) {
    return null;
  }

  return user;
}