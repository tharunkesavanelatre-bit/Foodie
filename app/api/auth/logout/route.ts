import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("fooddie_session")?.value;

    if (token) {
      const tokenHash = createHash("sha256")
        .update(token)
        .digest("hex");

      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    }

    const response = NextResponse.json({
      message: "Logged out successfully",
    });

    response.cookies.set("fooddie_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      { message: "Unable to log out" },
      { status: 500 }
    );
  }
}