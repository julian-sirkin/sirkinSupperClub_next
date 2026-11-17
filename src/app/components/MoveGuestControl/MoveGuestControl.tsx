'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { moveGuest } from '@/app/lib/apiClient';
import { buildMoveOptions, MoveSlotSource } from '@/app/utils/buildMoveOptions';
import { MoveGuestControlUI } from './MoveGuestControlUI';

interface MoveGuestControlProps {
  purchaseItemId: number;
  currentTicketId: number;
  partySize: number;
  slots: MoveSlotSource[];
  onMoved: (message: string) => void;
}

export function MoveGuestControl({
  purchaseItemId,
  currentTicketId,
  partySize,
  slots,
  onMoved,
}: MoveGuestControlProps) {
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const options = buildMoveOptions(slots, currentTicketId, partySize);

  if (options.length === 0) {
    return null;
  }

  const handleMove = async () => {
    if (!selectedTicketId || isMoving) return;
    setIsMoving(true);

    try {
      const response = await moveGuest(purchaseItemId, Number(selectedTicketId));
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to move guest');
        return;
      }

      onMoved(data.message);
    } catch (error) {
      console.error('Error moving guest:', error);
      toast.error('Error connecting to server');
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <MoveGuestControlUI
      options={options}
      selectedTicketId={selectedTicketId}
      isMoving={isMoving}
      onSelect={setSelectedTicketId}
      onMove={handleMove}
    />
  );
}
