import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function getAdminUser(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}