import { TicketWithPurchases } from "@/app/api/api.types"
import { AdminRefundForm } from "../AdminRefundForm/AdminRefundForm"

export const AdminTicketInfo = ({ticket}: {ticket: TicketWithPurchases}) => {


    return (
        <div className="bg-black mb-2 text-white">
            <header className="bg-gold font-bold text-2xl p-2">
                {new Date(ticket.ticketTime).toLocaleString("en-us", {hour: 'numeric', minute: 'numeric'})}
            </header>
            <div>
                {ticket.purchases.map(order => (
                        <div
                        key={order.purchaseId}
                        className="border-t-4 border-gold p-2 flex gap-12 justify-between"
                      >
                        <div>
                          <div>{order.customerName}</div>
                          <div>Quantity: {order.quantity}</div>
                        </div>
                        <AdminRefundForm order={order} />
                      </div>
                ))}
                
            </div>
        </div>
    )
}