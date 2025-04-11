'use client'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { StatusChangeFunction } from '@/types'
import { updatePaymentStatus } from '@/app/lib/apiClient'

export const PaymentStatusToggle = ({ 
    purchaseId, 
    initialStatus, 
    onStatusChange 
}: { 
    purchaseId: number, 
    initialStatus: boolean, 
    onStatusChange: StatusChangeFunction 
}) => {
    const [isPaid, setIsPaid] = useState(initialStatus)
    const [isUpdating, setIsUpdating] = useState(false)
    
    const togglePaymentStatus = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        
        try {
            const response = await updatePaymentStatus(purchaseId, !isPaid);
            
            const data = await response.json();
            
            if (response.ok) {
                const newStatus = !isPaid;
                setIsPaid(newStatus);
                onStatusChange(newStatus);
                toast.success(data.message);
            } else {
                toast.error(data.message || 'Failed to update payment status');
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error('Error connecting to server');
        } finally {
            setIsUpdating(false);
        }
    };
    
    return (
        <button
            onClick={togglePaymentStatus}
            disabled={isUpdating}
            className={`px-3 py-1 rounded transition-colors ${
                isUpdating 
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                    : isPaid 
                        ? 'bg-green-800 text-green-200 hover:bg-green-700' 
                        : 'bg-red-800 text-red-200 hover:bg-red-700'
            }`}
        >
            {isUpdating ? 'Updating...' : isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
        </button>
    );
}