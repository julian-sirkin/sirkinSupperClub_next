import { addTicket } from "./addTicket";
import { updateTicket } from "./updateTicket";
import { findTicketByContentfulId } from "@/app/api/queries/select";
import { linkTicketAddon, removeTicketAddonLinks, upsertAddonByContentfulId } from "@/app/api/queries/insert";

type SyncResults = {
  ticketsCreated: number;
  ticketsUpdated: number;
  errors: string[];
};

export async function processEventTickets(
  eventId: number,
  eventTitle: string,
  tickets: {
    contentfulTicketId: string;
    title: string;
    time: any;
    ticketsAvailable?: number;
    addons?: {
      contentfulAddonId: string;
      title: string;
      price: number;
    }[];
  }[],
  syncResults: SyncResults
): Promise<SyncResults> {
  const results = { ...syncResults };

  for (const ticket of tickets) {
    try {
      const existingTickets = await findTicketByContentfulId(ticket.contentfulTicketId);

      if (existingTickets.length === 0) {
        const newTicketId = await addTicket({
          contentfulId: ticket.contentfulTicketId,
          event: eventId,
          time: ticket.time,
          totalAvailable: ticket.ticketsAvailable || 10,
        });
        const addonIds: number[] = [];
        for (const addon of ticket.addons ?? []) {
          const addonId = await upsertAddonByContentfulId({
            contentfulId: addon.contentfulAddonId,
            title: addon.title,
            price: addon.price,
          });
          addonIds.push(addonId);
          await linkTicketAddon(newTicketId, addonId);
        }
        await removeTicketAddonLinks(newTicketId, addonIds);
        results.ticketsCreated += 1;
      } else {
        const existingTicket = existingTickets[0];
        await updateTicket(existingTicket.id, {
          event: eventId,
          time: ticket.time,
          totalAvailable: ticket.ticketsAvailable || existingTicket.totalAvailable,
        });

        const addonIds: number[] = [];
        for (const addon of ticket.addons ?? []) {
          const addonId = await upsertAddonByContentfulId({
            contentfulId: addon.contentfulAddonId,
            title: addon.title,
            price: addon.price,
          });
          addonIds.push(addonId);
          await linkTicketAddon(existingTicket.id, addonId);
        }
        await removeTicketAddonLinks(existingTicket.id, addonIds);
        results.ticketsUpdated += 1;
      }
    } catch (ticketError) {
      const errorMessage = ticketError instanceof Error ? ticketError.message : String(ticketError);
      console.error(`Ticket sync failed for ${eventTitle}:`, ticketError);
      results.errors.push(`${ticket.title || ticket.contentfulTicketId}: ${errorMessage}`);
    }
  }

  return results;
}
