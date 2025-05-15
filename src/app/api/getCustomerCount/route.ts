import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customersTable } from '@/db/schema';
import { count } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Count only customers with valid emails
    const result = await db
      .select({ value: count() })
      .from(customersTable)
      .where(eq(customersTable.email, customersTable.email)); // SQLite pattern for IS NOT NULL
    
    return NextResponse.json({ count: result[0].value });
  } catch (error) {
    console.error('Error getting customer count:', error);
    return NextResponse.json(
      { error: 'Failed to get customer count' },
      { status: 500 }
    );
  }
} 