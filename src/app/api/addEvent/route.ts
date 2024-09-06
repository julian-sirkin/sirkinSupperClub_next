import { contentfulService } from "@/app/contentful/contentfulService";
import { sortEventsByTime } from "@/app/helpers/sortEventsByTime";
import { db } from "@/db";
import { NextResponse } from "next/server";
import { createEventWithTickets } from "../queries/insert";


export async function POST(request: Request) {
    const contentful = contentfulService();
    const eventData = await contentful.getEvents();
    const {upcomingEvents} = sortEventsByTime(eventData)
    
    const eventsInDatabase = await db.query.eventsTable.findMany()

    const eventsNotInDatabase = upcomingEvents.filter(event => {
        return !eventsInDatabase.find(savedEvent => savedEvent.contentfulId === event.contentfulEventId)
    })

    if (eventsNotInDatabase.length > 0) {
    await createEventWithTickets(eventsNotInDatabase)
    }
    
    
    return NextResponse.json({status: 200})
}