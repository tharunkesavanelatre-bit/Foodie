import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserRole, hasRole } from "@/lib/roles";

export async function getAuthorizedUser(
  request: NextRequest,
  allowedRoles: readonly UserRole[]
) {
  // Get logged-in user
  const user = await getCurrentUser(request);

  // Check authentication
  if (!user) {
    return null;
  }

  // Check authorization
  if (!hasRole(user.role, allowedRoles)) {
    return null;
  }

  return user;
}