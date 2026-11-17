import { buildMoveOptions, MoveSlotSource } from '../buildMoveOptions';

const slot = (ticketId: number, isoTime: string, totalAvailable: number, totalSold: number): MoveSlotSource => ({
  ticketId,
  ticketTime: new Date(isoTime).getTime(),
  totalAvailable,
  totalSold,
});

const slots = [
  slot(4, '2026-12-01T20:00:00', 4, 4),
  slot(1, '2026-12-01T18:45:00', 6, 2),
  slot(3, '2026-12-01T19:30:00', 6, 2),
  slot(2, '2026-12-01T18:00:00', 6, 0),
];

describe('buildMoveOptions', () => {
  it('excludes the guest\'s current slot', () => {
    const options = buildMoveOptions(slots, 1, 2);
    expect(options.map((option) => option.ticketId)).not.toContain(1);
  });

  it('orders the remaining slots by time', () => {
    const options = buildMoveOptions(slots, 1, 2);
    expect(options.map((option) => option.ticketId)).toEqual([2, 3, 4]);
  });

  it('shows sold and open counts in the label', () => {
    const [firstOption] = buildMoveOptions(slots, 1, 2);
    expect(firstOption.label).toContain('6:00');
    expect(firstOption.label).toContain('0 sold');
    expect(firstOption.label).toContain('6 open');
  });

  it('disables a full slot', () => {
    const fullOption = buildMoveOptions(slots, 1, 2).find((option) => option.ticketId === 4);
    expect(fullOption?.isDisabled).toBe(true);
    expect(fullOption?.openSeats).toBe(0);
  });

  it('disables a slot with fewer open seats than the party size', () => {
    const tightSlots = [slot(1, '2026-12-01T18:00:00', 6, 2), slot(2, '2026-12-01T19:00:00', 6, 5)];
    expect(buildMoveOptions(tightSlots, 1, 2)[0].isDisabled).toBe(true);
    expect(buildMoveOptions(tightSlots, 1, 1)[0].isDisabled).toBe(false);
  });

  it('never reports negative open seats for an oversold slot', () => {
    const oversold = [slot(1, '2026-12-01T18:00:00', 6, 2), slot(2, '2026-12-01T19:00:00', 4, 6)];
    expect(buildMoveOptions(oversold, 1, 1)[0].openSeats).toBe(0);
  });

  it('returns nothing when the event has a single slot', () => {
    expect(buildMoveOptions([slot(1, '2026-12-01T18:00:00', 6, 2)], 1, 1)).toEqual([]);
  });
});
