import { formatSeatingTime } from "@/app/emails/orderSummary";
import { CONTACT_EMAIL, INSTAGRAM_URL, VENMO_URL } from "@/app/constants";
import { CartTicketType } from "@/store/cartStore.types";

const TicketLine = ({ ticket }: { ticket: CartTicketType }) => {
  const hasAddon =
    Boolean(ticket.selectedAddonContentfulId) && (ticket.addonQuantity ?? 0) > 0;

  return (
    <li className="bg-black/50 border border-gold/30 rounded p-3 text-left">
      <p className="text-gold font-semibold">{ticket.title}</p>
      <p className="text-sm text-white/90">
        {ticket.quantity} {ticket.quantity === 1 ? "seat" : "seats"} at{" "}
        {formatSeatingTime(ticket.time)}
      </p>
      {hasAddon ? (
        <p className="text-sm text-white/90">
          Add-on: {ticket.selectedAddonTitle} (x{ticket.addonQuantity})
        </p>
      ) : null}
    </li>
  );
};

export const CheckoutSuccessMessage = ({
  tickets,
  totalPrice,
  customerEmail,
}: {
  tickets: CartTicketType[];
  totalPrice: number;
  customerEmail: string;
}) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gold mb-2">You&apos;re in!</h2>
      <p className="mb-4">
        Your seats are confirmed. Thank you for taking a leap on this.
      </p>

      {tickets.length > 0 ? (
        <>
          <h3 className="text-gold font-semibold mb-2 text-left">What you reserved</h3>
          <ul className="space-y-2 mb-4">
            {tickets.map((ticket) => (
              <TicketLine key={ticket.contentfulTicketId} ticket={ticket} />
            ))}
          </ul>
        </>
      ) : null}

      <p className="mb-4 text-lg font-semibold text-gold">
        Order Total: ${totalPrice.toFixed(2)}
      </p>

      <div className="bg-black/50 border border-gold/30 rounded p-3 mb-4 text-left">
        <h3 className="text-gold font-semibold mb-1">Check your email</h3>
        <p className="text-sm mb-2">
          A confirmation is on its way to{" "}
          <span className="text-gold break-all">{customerEmail}</span> from{" "}
          <span className="text-gold break-all">{CONTACT_EMAIL}</span>.
        </p>
        <p className="text-sm">
          If it&apos;s not in your inbox within a few minutes,{" "}
          <span className="font-semibold text-gold">please check your spam folder</span>{" "}
          (and the Promotions tab in Gmail).
        </p>
      </div>

      <div className="mb-4">
        <p className="mb-2">Please complete your payment via Venmo:</p>
        <a
          href={VENMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gold text-black font-semibold px-6 py-3 rounded hover:bg-white transition-colors"
        >
          Pay ${totalPrice.toFixed(2)} with Venmo
        </a>
      </div>

      <p className="text-sm mb-2">
        I&apos;ll email you the location the day before the event.
      </p>
      <p className="text-sm">
        Questions? Reach out via{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold hover:underline">
          email
        </a>{" "}
        or{" "}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          Instagram
        </a>
        .
      </p>
    </div>
  );
};
