import { db } from "@/db";
import { eventsTable } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function POST(request: Request) {
    const contentfulId = 'abcd'
    const event = db.select().from(eventsTable).where(eq(eventsTable.cotentfulId, contentfulId) )
}