import Link from "next/link";
import { displayOrNA, EventRunOfShow, summarizeSeatingCounts } from "@/app/helpers/buildEventRunOfShow";
import { PrintRunOfShowButton } from "./PrintRunOfShowButton";

const actionClass =
  "bg-black text-gold px-4 py-3 rounded hover:bg-gold hover:text-black transition-colors min-h-[44px] inline-flex items-center justify-center print:hidden";

export function EventRunOfShowUI({
  eventId,
  runOfShow,
}: {
  eventId: number;
  runOfShow: EventRunOfShow;
}) {
  return (
    <div className="event-summary-print text-white">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-start print:mb-2 print:gap-1">
        <div>
          <p className="text-sm uppercase tracking-wide text-gold print:hidden">Event summary</p>
          <h2 className="text-3xl font-bold text-gold print:text-base print:font-bold print:text-black">
            {runOfShow.title}
          </h2>
          <p className="text-gray-400 mt-1 print:mt-0 print:text-xs print:text-black">{runOfShow.dateLabel}</p>
          <p className="mt-2 text-lg print:mt-0 print:text-xs print:text-black">
            {runOfShow.guestCount} guests · {runOfShow.partyCount}{" "}
            {runOfShow.partyCount === 1 ? "party" : "parties"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
          <PrintRunOfShowButton className={actionClass} />
          <Link href={`/admin/events/${eventId}`} className={actionClass}>
            Back to event
          </Link>
        </div>
      </div>

      {runOfShow.seatings.length === 0 ? (
        <p className="text-gray-400 print:text-black">No reservations yet.</p>
      ) : (
        <div className="space-y-6 print:space-y-2">
          {runOfShow.seatings.map(seating => (
            <section key={seating.timeKey} className="print:break-inside-avoid">
              <header className="mb-3 border-b border-gold/40 pb-1 print:mb-1 print:border-black">
                <h3 className="text-2xl font-bold text-gold print:text-sm print:text-black">
                  {seating.timeLabel}
                </h3>
                <p className="text-gray-300 print:text-xs print:text-black">
                  {summarizeSeatingCounts(seating)}
                </p>
              </header>
              <ul>
                {seating.parties.map(party => (
                  <li
                    key={`${seating.timeKey}-${party.purchaseId}`}
                    className="py-3 border-b border-white/10 print:py-1 print:border-neutral-300"
                  >
                    <p className="print:text-xs print:leading-tight">
                      <span className="font-bold">{party.customerName}</span>
                      <span className="text-gray-300 print:text-black"> · party of {party.size}</span>
                      {party.addonLabel && (
                        <span className="text-gray-300 print:text-black"> · {party.addonLabel}</span>
                      )}
                      <span className="text-gray-400 print:text-black">
                        {" "}
                        · {displayOrNA(party.customerPhone)} · {displayOrNA(party.customerEmail)}
                      </span>
                    </p>
                    <p
                      className={`print:text-xs print:leading-tight ${
                        party.dietaryRestrictions
                          ? "font-semibold text-red-300 print:text-black"
                          : "text-gray-400 print:text-black"
                      }`}
                    >
                      Dietary: {displayOrNA(party.dietaryRestrictions)}
                    </p>
                    <p className="text-gray-200 whitespace-pre-wrap break-words print:text-xs print:leading-snug print:text-black">
                      Notes: {displayOrNA(party.notes)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
