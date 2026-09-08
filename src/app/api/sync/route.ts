import { NextResponse } from 'next/server';
import { syncAllEvents } from '@/app/api/utils/syncAllEvents';
import { isAdminRequest, unauthorizedAdminResponse } from '@/app/api/utils/isAdminRequest';

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return unauthorizedAdminResponse();
  }

  try {
    const result = await syncAllEvents();

    if (!result.success) {
      return NextResponse.json({
        error: result.message || 'Failed to sync events',
        details: result.error,
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Events synchronized successfully',
      data: result,
      warnings: result.warnings ?? [],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Event sync route failed:', error);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
