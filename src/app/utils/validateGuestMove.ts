export type MoveSlot = {
  id: number;
  eventId: number | null;
  totalAvailable: number;
  totalSold: number;
};

export type GuestMoveInput = {
  quantity: number;
  sourceSlot: MoveSlot | undefined;
  targetSlot: MoveSlot | undefined;
  orderAlreadyInTarget: boolean;
};

export const validateGuestMove = ({
  quantity,
  sourceSlot,
  targetSlot,
  orderAlreadyInTarget,
}: GuestMoveInput): string | null => {
  if (!sourceSlot || !targetSlot) {
    return 'Time slot not found';
  }

  if (sourceSlot.id === targetSlot.id) {
    return 'Guest is already in that time slot';
  }

  if (sourceSlot.eventId !== targetSlot.eventId) {
    return 'Guests can only be moved within the same event';
  }

  if (orderAlreadyInTarget) {
    return 'This order already has seats in that time slot';
  }

  const openSeats = targetSlot.totalAvailable - targetSlot.totalSold;
  if (openSeats < quantity) {
    return `Only ${Math.max(openSeats, 0)} open seat(s) in that time slot`;
  }

  return null;
};
