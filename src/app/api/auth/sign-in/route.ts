import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE, SEVEN_DAYS } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Log the event
    try {
      await db.loginEvent.create({
        data: {
          userId: user.id,
          ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
        },
      });
    } catch (e) {
      // Don't fail sign-in if logging fails
    }

    // Determine role-based redirect
    const membership = await db.membership.findFirst({
      where: { userId: user.id },
      select: { role: true },
    });
    const role = membership?.role ?? "TEAM_MEMBER";
    const isAdvisory = ["ADVISOR", "HEAD_OF_ADVISORY", "ADMIN"].includes(role);

    const token = createSessionToken(user.id);
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      role,
      redirectTo: isAdvisory ? "/advisory" : "/app/dashboard",
    });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SEVEN_DAYS / 1000,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[sign-in] Error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
