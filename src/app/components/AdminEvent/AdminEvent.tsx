export const AdminEvent = ({eventId, resetEvent}: {eventId: number, resetEvent: (event: number | null ) => void}) => {
    return (<div>
        <h3>Singular Event</h3>
        <button onClick={() => resetEvent(null)}>Back To Events</button>
    </div>)
}