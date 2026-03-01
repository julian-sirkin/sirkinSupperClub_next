import { NextResponse } from 'next/server';
import { syncAllEvents } from '@/app/api/utils/syncAllEvents';

function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
}

export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log("=== SYNC API ROUTE CALLED ===");
  console.log(`Request ID: ${requestId}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Request method: ${request.method}`);
  console.log(`Request URL: ${request.url}`);
  console.log(`Request headers: ${safeStringify(Object.fromEntries(request.headers.entries()))}`);
  
  try {
    console.log("=== SYNC API: Starting syncAllEvents ===");
    console.log(`Request ID: ${requestId}`);
    const syncStartTime = Date.now();
    
    const result = await syncAllEvents();
    
    const syncDuration = Date.now() - syncStartTime;
    const totalDuration = Date.now() - startTime;
    
    console.log("=== SYNC API: syncAllEvents completed ===");
    console.log(`Request ID: ${requestId}`);
    console.log(`Sync duration: ${syncDuration}ms`);
    console.log(`Total route duration: ${totalDuration}ms`);
    console.log(`Result success: ${result.success}`);
    console.log(`Result hasPartialFailures: ${result.hasPartialFailures || false}`);
    console.log(`Result keys: ${Object.keys(result).join(', ')}`);
    console.log(`Full result: ${safeStringify(result)}`);
    
    if (result.success) {
      console.log("=== SYNC API: Full success ===");
      console.log(`Request ID: ${requestId}`);
      console.log(`Sync completed successfully in ${totalDuration}ms`);
      console.log(`Sync Result: ${safeStringify(result)}`);
      
      const response = NextResponse.json({ 
        message: 'Events synchronized successfully', 
        data: result 
      });
      
      console.log("=== SYNC API: Returning success response ===");
      console.log(`Request ID: ${requestId}`);
      console.log(`Response status: 200`);
      console.log(`Response body: ${safeStringify({ message: 'Events synchronized successfully', data: result })}`);
      
      return response;
    } else {
      // Check if it's a partial failure (some items succeeded, some failed)
      const isPartialFailure = result.hasPartialFailures && 
        (result.eventsCreated > 0 || result.eventsUpdated > 0 || 
         result.ticketsCreated > 0 || result.ticketsUpdated > 0);
      
      console.log("=== SYNC API: Evaluating failure type ===");
      console.log(`Request ID: ${requestId}`);
      console.log(`Result success: ${result.success}`);
      console.log(`Result hasPartialFailures: ${result.hasPartialFailures || false}`);
      console.log(`Events created: ${result.eventsCreated || 0}`);
      console.log(`Events updated: ${result.eventsUpdated || 0}`);
      console.log(`Tickets created: ${result.ticketsCreated || 0}`);
      console.log(`Tickets updated: ${result.ticketsUpdated || 0}`);
      console.log(`Is partial failure: ${isPartialFailure}`);
      
      if (isPartialFailure) {
        console.error("=== SYNC API: Partial failure detected ===");
        console.error(`Request ID: ${requestId}`);
        console.error(`Sync completed with errors after ${totalDuration}ms`);
        console.error(`Partial Failure Result: ${safeStringify(result)}`);
        console.error(`Errors array: ${safeStringify(result.errors || [])}`);
        console.error(`Error count: ${result.errors?.length || 0}`);
        
        const responseBody = { 
          error: 'Sync completed with errors',
          message: result.message || 'Some events/tickets failed to sync',
          details: result.error || result.errors,
          data: result,
          hasPartialFailures: true
        };
        
        console.error("=== SYNC API: Returning partial failure response (207) ===");
        console.error(`Request ID: ${requestId}`);
        console.error(`Response status: 207`);
        console.error(`Response body: ${safeStringify(responseBody)}`);
        
        return NextResponse.json(responseBody, { status: 207 }); // 207 Multi-Status for partial success
      } else {
        console.error("=== SYNC API: Complete failure ===");
        console.error(`Request ID: ${requestId}`);
        console.error(`Sync failed after ${totalDuration}ms`);
        console.error(`Sync Error: ${safeStringify(result)}`);
        console.error(`Error message: ${result.message || 'N/A'}`);
        console.error(`Error details: ${safeStringify(result.error || 'N/A')}`);
        
        const responseBody = { 
          error: result.message || 'Failed to sync events',
          details: result.error
        };
        
        console.error("=== SYNC API: Returning error response (500) ===");
        console.error(`Request ID: ${requestId}`);
        console.error(`Response status: 500`);
        console.error(`Response body: ${safeStringify(responseBody)}`);
        
        return NextResponse.json(responseBody, { status: 500 });
      }
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    console.error('=== SYNC API ROUTE ERROR ===');
    console.error(`Request ID: ${requestId}`);
    console.error(`Error occurred after ${duration}ms`);
    console.error(`Error name: ${errorName}`);
    console.error(`Error message: ${errorMessage}`);
    console.error(`Error stack: ${errorStack || 'No stack trace available'}`);
    console.error(`Full error object: ${safeStringify(error)}`);
    console.error(`Error type: ${typeof error}`);
    console.error(`Error constructor: ${error?.constructor?.name || 'N/A'}`);
    
    if (error instanceof TypeError) {
      console.error('=== SYNC API: TypeError detected ===');
      console.error(`Request ID: ${requestId}`);
      console.error('This is a TypeError - likely a database connection or type mismatch issue');
    } else if (error instanceof SyntaxError) {
      console.error('=== SYNC API: SyntaxError detected ===');
      console.error(`Request ID: ${requestId}`);
      console.error('This is a SyntaxError - likely a code or data parsing issue');
    } else if (error instanceof Error) {
      console.error('=== SYNC API: Generic Error detected ===');
      console.error(`Request ID: ${requestId}`);
      console.error('This is a generic Error');
    }
    
    const responseBody = { 
      error: errorMessage,
      stack: errorStack
    };
    
    console.error('=== SYNC API: Returning error response (500) ===');
    console.error(`Request ID: ${requestId}`);
    console.error(`Response status: 500`);
    console.error(`Response body: ${safeStringify(responseBody)}`);
    
    return NextResponse.json(responseBody, { status: 500 });
  }
} 