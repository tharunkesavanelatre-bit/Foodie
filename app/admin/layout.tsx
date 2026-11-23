import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const token = cookieStore.get("fooddie_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    redirect("/login");
  }

  // Allow only recognized admin roles.
  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

  // Preserve email verification for the legacy ADMIN account.
  if (session.user.role === "ADMIN") {
    const adminEmail = process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

    if (
      !adminEmail ||
      session.user.email.trim().toLowerCase() !== adminEmail
    ) {
      redirect("/");
    }
  }

  return <>{children}</>;
}