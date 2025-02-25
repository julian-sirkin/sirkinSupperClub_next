import { NextRequest, NextResponse } from "next/server";
import { syncAllEvents } from "@/app/api/utils/syncAllEvents";

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const result = await syncAllEvents();
    
    return NextResponse.json({ 
      message: 'Events synchronized successfully', 
      data: result 
    });
  } catch (error) {
    console.error('Error syncing events:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to sync events' 
    }, { status: 500 });
  }
} 