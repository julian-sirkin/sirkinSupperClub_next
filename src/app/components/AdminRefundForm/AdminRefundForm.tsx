import { AdminPurchase } from "@/app/api/api.types";
import { useState } from "react";
import { toast } from 'react-toastify';

export const AdminRefundForm = ({
  order, 
  setRefundToast
}: {
  order: AdminPurchase, 
  setRefundToast: (toastText: string, refundedQuantity?: number) => void
}) => {
  const [refundQuantity, setRefundQuantity] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleRefundSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (refundQuantity < 1 || refundQuantity > Number(order.quantity)) {
      setRefundToast(`Invalid quantity. Please enter a number between 1 and ${order.quantity}`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const body = JSON.stringify({
        orderId: order.purchaseId,
        ticketId: order.ticketId,
        quantity: refundQuantity
      });

      const refundResult = await fetch('/api/refundTickets', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          }, 
          body
      });
      
      const result = await refundResult.json();
      
      if (refundResult.ok && result.success) {
          toast.success('Successfully Refunded', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
          });
          
          setRefundToast('', refundQuantity);
          
          setRefundQuantity(1);
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
    <form className="flex items-center gap-3" onSubmit={handleRefundSubmit}>
      <div className="flex flex-col">
        <label htmlFor="refundQuantity" className="text-sm text-gray-400 mb-1">Refund Qty:</label>
        <input
          id="refundQuantity"
          className="bg-gray-800 text-white w-16 text-center rounded px-2 py-1 border border-gray-700"
          type="number"
          value={refundQuantity}
          onChange={(e) => setRefundQuantity(Number(e.currentTarget.value))}
          min={1}
          max={Number(order.quantity)}
          disabled={isProcessing}
        />
      </div>
      <button 
        className={`bg-gold text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`} 
        type="submit"
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Refund'}
      </button>
      <button 
        className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-red-500 transition-colors"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setRefundQuantity(Number(order.quantity));
        }}
        disabled={isProcessing}
      >
        Refund All
      </button>
    </form>
  );
};
