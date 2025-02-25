import { NextResponse } from 'next/server';
import { syncAllEvents } from '@/app/api/utils/syncAllEvents';

export async function POST() {
  try {
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