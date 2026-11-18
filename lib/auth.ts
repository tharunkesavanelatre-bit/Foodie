import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("fooddie_session")?.value;

  if (!token) {
    return null;
  }

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    }

    return null;
  }

  return session.user;
}
