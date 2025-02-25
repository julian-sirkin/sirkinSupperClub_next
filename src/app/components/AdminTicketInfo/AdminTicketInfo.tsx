import { TicketWithPurchases } from "@/app/api/api.types"
import { AdminRefundForm } from "../AdminRefundForm/AdminRefundForm"
import { PaymentStatusToggle } from "../PaymentStatusToggle/PaymentStatusToggle"
import { formatDate } from "@/app/utils/formatDate"
import Link from "next/link"
import { useState } from "react"

export const AdminTicketInfo = ({ticket, setRefundToast}: {ticket: TicketWithPurchases, setRefundToast: (toastText: string) => void}) => {
    const ticketDate = new Date(ticket.ticketTime)
    const hasPurchases = ticket.purchases && ticket.purchases.length > 0
    const [purchases, setPurchases] = useState(ticket.purchases)
    
    const handlePaymentStatusChange = (purchaseId: number, newStatus: boolean) => {
        setPurchases(prevPurchases => 
            prevPurchases.map(purchase => 
                purchase.purchaseId === purchaseId 
                    ? {...purchase, paid: newStatus} 
                    : purchase
            )
        )
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
                            className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white"
                        >
                            <div className="space-y-1">
                                <Link href={`/admin?view=customer&id=${order.customerId}`} className="font-bold text-lg hover:text-gold transition-colors">
                                    {order.customerName}
                                </Link>
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
                                <AdminRefundForm order={order} setRefundToast={setRefundToast}/>
                            </div>
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