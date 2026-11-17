import { MoveSlot, validateGuestMove } from '../validateGuestMove';

const sourceSlot: MoveSlot = { id: 1, eventId: 10, totalAvailable: 6, totalSold: 2 };
const openTargetSlot: MoveSlot = { id: 2, eventId: 10, totalAvailable: 6, totalSold: 2 };

const buildInput = (overrides: Partial<Parameters<typeof validateGuestMove>[0]> = {}) => ({
  quantity: 2,
  sourceSlot,
  targetSlot: openTargetSlot,
  orderAlreadyInTarget: false,
  ...overrides,
});

describe('validateGuestMove', () => {
  it('allows a move into a slot with enough open seats', () => {
    expect(validateGuestMove(buildInput())).toBeNull();
  });

  it('allows a move that exactly fills the target slot', () => {
    const targetSlot = { ...openTargetSlot, totalSold: 4 };
    expect(validateGuestMove(buildInput({ targetSlot }))).toBeNull();
  });

  it('rejects when a slot cannot be found', () => {
    expect(validateGuestMove(buildInput({ targetSlot: undefined }))).toBe('Time slot not found');
    expect(validateGuestMove(buildInput({ sourceSlot: undefined }))).toBe('Time slot not found');
  });

  it('rejects moving into the same slot', () => {
    expect(validateGuestMove(buildInput({ targetSlot: sourceSlot }))).toBe(
      'Guest is already in that time slot'
    );
  });

  it('rejects moving to a slot of a different event', () => {
    const targetSlot = { ...openTargetSlot, eventId: 99 };
    expect(validateGuestMove(buildInput({ targetSlot }))).toBe(
      'Guests can only be moved within the same event'
    );
  });

  it('rejects when the order already has seats in the target slot', () => {
    expect(validateGuestMove(buildInput({ orderAlreadyInTarget: true }))).toBe(
      'This order already has seats in that time slot'
    );
  });

  it('rejects when the target slot has fewer open seats than the party size', () => {
    const targetSlot = { ...openTargetSlot, totalSold: 5 };
    expect(validateGuestMove(buildInput({ targetSlot }))).toBe(
      'Only 1 open seat(s) in that time slot'
    );
  });

  it('reports zero open seats for an oversold slot', () => {
    const targetSlot = { ...openTargetSlot, totalSold: 9 };
    expect(validateGuestMove(buildInput({ targetSlot }))).toBe(
      'Only 0 open seat(s) in that time slot'
    );
  });
});
