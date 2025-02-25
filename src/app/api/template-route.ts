import { NextResponse } from 'next/server';

// Handler for GET requests
export async function GET(request: Request) {
  try {
    // Your logic here
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An error occurred' 
    }, { status: 500 });
  }
}

// Handler for POST requests
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Your logic here
    return NextResponse.json({ message: 'Success', data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An error occurred' 
    }, { status: 500 });
  }
} 