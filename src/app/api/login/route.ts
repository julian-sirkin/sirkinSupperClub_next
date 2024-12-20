import Cookies from "js-cookie";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json(); // Parse the request body
    const { password } = body; // Extract password
    const adminPassword = process.env.ADMIN_PASSWORD as string ?? undefined
    const adminLoginCookieValue = process.env.ADMIN_VERIFIED_COOKIE as string;
    
    if (password === adminPassword) {
      const response = NextResponse.json({ status: 200, success: true });
      response.cookies.set(adminLoginCookieValue, 'true'); // Set the cookie in the response
      return response;
    } else {
      return NextResponse.json({success: false }, { status: 401} );
    }
}