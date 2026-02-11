import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, createAdminToken } from "@/lib/auth/admin";
import { adminLoginSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(adminLoginSchema, body);
    if ("error" in validation) return validation.error;

    const { password } = validation.data;

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Falsches Passwort" },
        { status: 401 }
      );
    }

    const token = await createAdminToken();

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
