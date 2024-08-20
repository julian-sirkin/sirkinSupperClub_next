import { ParsedTicket } from "@/app/contentful/contentfulServices.types";

export const Ticket = ({ ticket }: { ticket: ParsedTicket }) => {
  return (
    <div>
      <h3>{ticket.title}</h3>
    </div>
  );
};
