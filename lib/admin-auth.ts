import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function getAdminUser(request: NextRequest) {
  const user = await getCurrentUser(request);

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (
    !user ||
    !adminEmail ||
    user.email.trim().toLowerCase() !== adminEmail ||
    user.role !== "ADMIN"
  ) {
    return null;
  }

  return user;
}