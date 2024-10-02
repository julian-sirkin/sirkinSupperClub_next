import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json(); // Parse the request body
    const { password } = body; // Extract password

    if (password === (process.env.ADMIN_PASSWORD as string)) {
      return NextResponse.json({status: 200, success: true})
    } else {
      return NextResponse.json({status: 401, success: false})
    }
  }