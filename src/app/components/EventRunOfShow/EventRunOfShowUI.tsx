import Link from "next/link";
import { EventRunOfShow, summarizeSeatingCounts } from "@/app/helpers/buildEventRunOfShow";
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
    <div className="run-of-show text-white print:bg-white print:text-black">
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:justify-between md:items-start">
        <div>
          <p className="text-sm uppercase tracking-wide text-gold print:text-black">Run of show</p>
          <h2 className="text-3xl font-bold text-gold print:text-black">{runOfShow.title}</h2>
          <p className="text-gray-400 mt-1 print:text-black">{runOfShow.dateLabel}</p>
          <p className="mt-3 text-lg">
            {runOfShow.guestCount} guests across {runOfShow.partyCount}{" "}
            {runOfShow.partyCount === 1 ? "party" : "parties"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <PrintRunOfShowButton className={actionClass} />
          <Link href={`/admin/events/${eventId}`} className={actionClass}>
            Back to event
          </Link>
        </div>
      </div>

      {runOfShow.seatings.length === 0 ? (
        <p className="text-gray-400 print:text-black">No reservations yet.</p>
      ) : (
        <div className="space-y-8">
          {runOfShow.seatings.map(seating => (
            <section
              key={seating.timeKey}
              className="break-inside-avoid border border-gold/40 rounded-lg p-4 print:border-black"
            >
              <header className="mb-4">
                <h3 className="text-2xl font-bold text-gold print:text-black">{seating.timeLabel}</h3>
                <p className="text-gray-300 print:text-black">{summarizeSeatingCounts(seating)}</p>
              </header>
              <ul className="space-y-4">
                {seating.parties.map(party => (
                  <li
                    key={`${seating.timeKey}-${party.purchaseId}`}
                    className="bg-black/40 rounded-lg p-4 print:bg-white print:border print:border-black"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                      <p className="text-lg font-bold">
                        {party.customerName}{" "}
                        <span className="font-normal text-gray-300 print:text-neutral-700">
                          · party of {party.size}
                        </span>
                      </p>
                      <p className="text-sm text-gray-400 print:text-neutral-700">
                        {party.customerPhone ?? "No phone"} · {party.customerEmail}
                      </p>
                    </div>
                    {party.dietaryRestrictions && (
                      <p className="mt-3 bg-red-900/40 text-red-200 font-semibold px-3 py-2 rounded print:bg-transparent print:text-black print:border print:border-black">
                        Dietary: {party.dietaryRestrictions}
                      </p>
                    )}
                    {party.notes && (
                      <p className="mt-2 text-gray-200 print:text-black">Notes: {party.notes}</p>
                    )}
                    {party.addonLabel && (
                      <p className="mt-2 text-gray-300 print:text-black">Add-on: {party.addonLabel}</p>
                    )}
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
