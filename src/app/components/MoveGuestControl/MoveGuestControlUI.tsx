import { MoveOption } from '@/app/utils/buildMoveOptions';

interface MoveGuestControlUIProps {
  options: MoveOption[];
  selectedTicketId: string;
  isMoving: boolean;
  onSelect: (ticketId: string) => void;
  onMove: () => void;
}

export function MoveGuestControlUI({
  options,
  selectedTicketId,
  isMoving,
  onSelect,
  onMove,
}: MoveGuestControlUIProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <select
        value={selectedTicketId}
        onChange={(event) => onSelect(event.target.value)}
        disabled={isMoving}
        aria-label="Move guest to another time slot"
        className="bg-gray-800 text-white rounded px-3 py-2 min-h-[44px] disabled:opacity-50"
      >
        <option value="">Move to…</option>
        {options.map((option) => (
          <option key={option.ticketId} value={option.ticketId} disabled={option.isDisabled}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onMove}
        disabled={!selectedTicketId || isMoving}
        className="bg-gold text-black px-3 py-2 rounded min-h-[44px] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isMoving ? 'Moving...' : 'Move'}
      </button>
    </div>
  );
}
