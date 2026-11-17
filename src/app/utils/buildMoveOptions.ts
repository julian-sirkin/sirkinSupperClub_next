export type MoveSlotSource = {
  ticketId: number;
  ticketTime: number | string;
  totalAvailable: number;
  totalSold: number;
};

export type MoveOption = {
  ticketId: number;
  label: string;
  openSeats: number;
  isDisabled: boolean;
};

const formatSlotTime = (time: number | string): string =>
  new Date(time).toLocaleString('en-us', { hour: 'numeric', minute: 'numeric' });

export const buildMoveOptions = (
  slots: MoveSlotSource[],
  currentTicketId: number,
  partySize: number
): MoveOption[] =>
  slots
    .filter((slot) => slot.ticketId !== currentTicketId)
    .sort((a, b) => new Date(a.ticketTime).getTime() - new Date(b.ticketTime).getTime())
    .map((slot) => {
      const openSeats = Math.max(slot.totalAvailable - slot.totalSold, 0);
      return {
        ticketId: slot.ticketId,
        label: `${formatSlotTime(slot.ticketTime)} · ${slot.totalSold} sold · ${openSeats} open`,
        openSeats,
        isDisabled: openSeats < partySize,
      };
    });
