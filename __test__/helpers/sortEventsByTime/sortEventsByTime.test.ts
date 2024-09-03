import { sortEventsByTime } from "@/app/helpers/sortEventsByTime"
import { eventsFixture } from "./sortEventsByTime.fixture"

describe('SortEventsByTime', () => {
    it('Returns an object with 2 empty arrays if there are no events', ()=> {
        const sortedEvents = sortEventsByTime([])
        
        expect(sortedEvents.pastEvents).toHaveLength(0)
        expect(sortedEvents.upcomingEvents).toHaveLength(0)
    })

    it('Sorts events from soonest to furthest out', () => {
        const {pastEvents, upcomingEvents} = sortEventsByTime(eventsFixture)

        expect(pastEvents).toHaveLength(1)
        expect(pastEvents[0].title).toEqual('In the past event')

        expect(upcomingEvents).toHaveLength(2)
        expect(upcomingEvents[0].title).toEqual('Next Event')
        expect(upcomingEvents[1].title).toEqual('Way in the future event')
    })
})