import { AdminPurchase } from "@/app/api/api.types";
import { useState } from "react";
import { toast } from 'react-toastify';
import { refundTickets } from "@/app/lib/apiClient";

export const AdminRefundForm = ({
  order, 
  setRefundToast,
  onRefundApplied,
}: {
  order: AdminPurchase, 
  setRefundToast: (toastText: string, refundedQuantity?: number) => void,
  onRefundApplied?: (payload: {
    target: "ticket" | "addon";
    refundedTicketQuantity?: number;
    refundedAddonQuantity?: number;
    autoRefundedAddonQuantity?: number;
    remainingTicketQuantity?: number;
    remainingAddonQuantity?: number;
    purchaseId: number;
  }) => void
}) => {
  const [ticketRefundQuantity, setTicketRefundQuantity] = useState<number>(1);
  const [addonRefundQuantity, setAddonRefundQuantity] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const addonQuantity = Number(order.addonQuantity ?? 0);
  const hasAddonQuantity = addonQuantity > 0;

  const handleRefundSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    refundTarget: "ticket" | "addon"
  ) => {
    e.preventDefault();

    const refundQuantity = refundTarget === "ticket" ? ticketRefundQuantity : addonRefundQuantity;
    const maxQuantity = refundTarget === "ticket" ? Number(order.quantity) : addonQuantity;

    if (refundQuantity < 1 || refundQuantity > maxQuantity) {
      setRefundToast(`Invalid quantity. Please enter a number between 1 and ${maxQuantity}`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const refundResult = await refundTickets(
        order.purchaseId, 
        order.ticketId, 
        refundQuantity,
        refundTarget,
        order.purchaseItemsId,
        order.addonId ?? undefined
      );
      const result = await refundResult.json();
      
      if (refundResult.ok && result.success) {
          toast.success(`Successfully Refunded ${refundTarget === "ticket" ? "Tickets" : "Addons"}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
          });
          
          const refundData = result?.data;
          setRefundToast('', refundData?.refundedTicketQuantity ?? (refundTarget === "ticket" ? refundQuantity : 0));
          if (refundData && onRefundApplied) {
            onRefundApplied(refundData);
          }
          
          if (refundTarget === "ticket") {
            setTicketRefundQuantity(1);
          } else {
            setAddonRefundQuantity(1);
          }
      } else {
          toast.error(`Refund Failed: ${result.message || 'Unknown error'}`, {
              position: "top-right",
              autoClose: 5000,
          });
          
          setRefundToast('', 0);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Server error while processing refund', {
          position: "top-right",
          autoClose: 5000,
      });
      
      setRefundToast('', 0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <form className="flex flex-col md:flex-row md:items-end gap-2 bg-gray-900/70 border border-gold/30 rounded p-3" onSubmit={(e) => handleRefundSubmit(e, "ticket")}>
        <div className="flex flex-col">
          <label htmlFor={`ticketRefundQuantity-${order.purchaseId}`} className="text-sm text-gray-400 mb-1">
            Ticket Refund Qty
          </label>
          <input
            id={`ticketRefundQuantity-${order.purchaseId}`}
            className="bg-gray-800 text-white w-20 text-center rounded px-2 py-1 border border-gray-700"
            type="number"
            value={ticketRefundQuantity}
            onChange={(e) => setTicketRefundQuantity(Number(e.currentTarget.value))}
            min={1}
            max={Number(order.quantity)}
            disabled={isProcessing}
          />
        </div>
        <button
          className="bg-gold text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Refund Tickets"}
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-red-500 transition-colors"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setTicketRefundQuantity(Number(order.quantity));
          }}
          disabled={isProcessing}
        >
          Refund All Tickets
        </button>
      </form>

      {hasAddonQuantity && (
        <form className="flex flex-col md:flex-row md:items-end gap-2 bg-gray-900/70 border border-blue-400/30 rounded p-3" onSubmit={(e) => handleRefundSubmit(e, "addon")}>
          <div className="flex flex-col">
            <label htmlFor={`addonRefundQuantity-${order.purchaseId}`} className="text-sm text-gray-400 mb-1">
              Addon Refund Qty
            </label>
            <input
              id={`addonRefundQuantity-${order.purchaseId}`}
              className="bg-gray-800 text-white w-20 text-center rounded px-2 py-1 border border-gray-700"
              type="number"
              value={addonRefundQuantity}
              onChange={(e) => setAddonRefundQuantity(Number(e.currentTarget.value))}
              min={1}
              max={addonQuantity}
              disabled={isProcessing}
            />
          </div>
          <button
            className="bg-gold text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Refund Addons"}
          </button>
          <button
            className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-red-500 transition-colors"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setAddonRefundQuantity(addonQuantity);
            }}
            disabled={isProcessing}
          >
            Refund All Addons
          </button>
        </form>
      )}
    </div>
  );
};
