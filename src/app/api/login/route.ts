import {
  adminSessionCookieOptions,
  createAdminSessionToken,
  getAdminCookieName,
} from "@/app/lib/adminSession";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { password } = body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const token = await createAdminSessionToken();

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Admin sessions are not configured" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ status: 200, success: true });
  response.cookies.set(getAdminCookieName(), token, adminSessionCookieOptions);

  return response;
}
