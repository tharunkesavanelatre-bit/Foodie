import { NextRequest, NextResponse, connection } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const token = request.cookies.get("fooddie_session")?.value;

    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.expiresAt <= new Date()) {
      if (session) {
        await prisma.session.delete({
          where: { id: session.id },
        });
      }

      const response = NextResponse.json(
        { user: null },
        { status: 401 }
      );

      response.cookies.set("fooddie_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      {
        user: {
          name: session.user.name,
          email: session.user.email,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Session verification error:", error);

    return NextResponse.json(
      { message: "Unable to verify session" },
      { status: 500 }
    );
  }
}