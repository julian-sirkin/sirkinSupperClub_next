import { NextResponse } from 'next/server';
import { syncAllEvents } from '@/app/api/utils/syncAllEvents';

export async function POST() {
  try {
    console.log("Sync API route called");
    const result = await syncAllEvents();
    
    if (result.success) {
      console.log("Sync completed successfully:", result.results);
      return NextResponse.json({ 
        message: 'Events synchronized successfully', 
        data: result 
      });
    } else {
      console.error("Sync failed:", result.error);
      return NextResponse.json({ 
        error: result.message || 'Failed to sync events',
        details: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in sync API route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to sync events',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 