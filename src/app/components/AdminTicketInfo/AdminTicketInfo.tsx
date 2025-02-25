import { TicketWithPurchases } from "@/app/api/api.types"
import { AdminRefundForm } from "../AdminRefundForm/AdminRefundForm"
import { PaymentStatusToggle } from "../PaymentStatusToggle/PaymentStatusToggle"
import { formatDate } from "@/app/utils/formatDate"
import Link from "next/link"
import { useState } from "react"
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

export const AdminTicketInfo = ({ticket: initialTicket, setRefundToast}: {
  ticket: TicketWithPurchases, 
  setRefundToast: (toastText: string) => void
}) => {
    const [ticket, setTicket] = useState(initialTicket);
    const ticketDate = new Date(ticket.ticketTime)
    const hasPurchases = ticket.purchases && ticket.purchases.length > 0
    const [purchases, setPurchases] = useState(ticket.purchases)
    const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});
    
    const handlePaymentStatusChange = (purchaseId: number, newStatus: boolean) => {
        setPurchases(prevPurchases => 
            prevPurchases.map(purchase => 
                purchase.purchaseId === purchaseId 
                    ? {...purchase, paid: newStatus} 
                    : purchase
            )
        )
    }
    
    const handleRefund = (message: string, refundedQuantity?: number) => {
        // Only update the UI if we have a quantity
        if (refundedQuantity && refundedQuantity > 0) {
            setTicket(prevTicket => ({
                ...prevTicket,
                totalSold: Math.max(0, prevTicket.totalSold - refundedQuantity)
            }));
        }
        
        // Only pass the message to parent if it's not empty
        if (message) {
            setRefundToast(message);
        }
    }
    
    const toggleOrderDetails = (purchaseId: number) => {
        setExpandedOrders(prev => ({
            ...prev,
            [purchaseId]: !prev[purchaseId]
        }));
    }

    return (
        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
            <header className="bg-gold text-black font-bold text-xl p-3 flex justify-between items-center">
                <div>
                    {formatDate(ticketDate)} at {ticketDate.toLocaleString("en-us", {hour: 'numeric', minute: 'numeric'})}
                </div>
                <div className="text-sm">
                    Total Available: {ticket.totalAvailable} | Sold: {ticket.totalSold}
                </div>
            </header>
            
            {hasPurchases ? (
                <div className="divide-y divide-gray-800">
                    {purchases.map(order => (
                        <div
                            key={order.purchaseId}
                            className="p-4 flex flex-col gap-4 text-white"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Link 
                                            href={`/admin?view=customer&id=${order.customerId}`} 
                                            className="font-bold text-lg hover:text-gold transition-colors"
                                        >
                                            {order.customerName}
                                        </Link>
                                        <button 
                                            onClick={() => toggleOrderDetails(order.purchaseId)}
                                            className="p-1 rounded-full hover:bg-gray-800 transition-colors"
                                        >
                                            {expandedOrders[order.purchaseId] ? 
                                                <FiChevronUp className="text-gold" /> : 
                                                <FiChevronDown className="text-gold" />
                                            }
                                        </button>
                                    </div>
                                    <div className="text-gray-400">{order.customerEmail}</div>
                                    <div className="flex gap-2">
                                        <div className="bg-gold/20 inline-block px-2 py-1 rounded text-gold">
                                            Quantity: {order.quantity}
                                        </div>
                                        {order.paid !== undefined && (
                                            <div className={`inline-block px-2 py-1 rounded ${order.paid ? 'bg-green-800/30 text-green-400' : 'bg-red-800/30 text-red-400'}`}>
                                                {order.paid ? 'Paid' : 'Unpaid'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <PaymentStatusToggle 
                                        purchaseId={order.purchaseId} 
                                        initialStatus={!!order.paid} 
                                        onStatusChange={(newStatus) => handlePaymentStatusChange(order.purchaseId, newStatus)}
                                    />
                                    <AdminRefundForm 
                                        order={order} 
                                        setRefundToast={handleRefund}
                                    />
                                </div>
                            </div>
                            
                            {expandedOrders[order.purchaseId] && (
                                <div className="bg-gray-900 p-3 rounded mt-2 space-y-3">
                                    <div>
                                        <h4 className="text-sm text-gray-400 mb-1">Purchase Date:</h4>
                                        <p>{formatDate(new Date(order.purchaseDate))}</p>
                                    </div>
                                    
                                    {order.dietaryRestrictions && (
                                        <div>
                                            <h4 className="text-sm text-gray-400 mb-1">Dietary Restrictions:</h4>
                                            <p className="bg-black/30 p-2 rounded">{order.dietaryRestrictions}</p>
                                        </div>
                                    )}
                                    
                                    {order.notes && (
                                        <div>
                                            <h4 className="text-sm text-gray-400 mb-1">Notes:</h4>
                                            <p className="bg-black/30 p-2 rounded">{order.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center text-gray-400">
                    No purchases for this ticket time.
                </div>
            )}
        </div>
    )
}