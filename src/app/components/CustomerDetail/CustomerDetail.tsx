'use client'
import { useState, useEffect } from 'react'
import { formatDate } from '@/app/utils/formatDate'
import { toast } from 'react-toastify'

type CustomerPurchase = {
    eventId: number
    eventTitle: string
    eventDate: number
    ticketId: number
    ticketTime: number
    quantity: number
    purchaseId: number
    purchaseDate: number
}

type CustomerDetails = {
    id: number
    name: string
    email: string
    phoneNumber: string | null
    notes: string | null
    priorCustomer: boolean
    purchases: CustomerPurchase[]
}

export const CustomerDetail = ({ customerId, onBack }: { customerId: number, onBack: () => void }) => {
    const [customer, setCustomer] = useState<CustomerDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCustomerData = async () => {
            setIsLoading(true)
            setError(null)
            
            try {
                const response = await fetch('/api/getCustomerDetails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ customerId }),
                })
                
                const data = await response.json()
                
                if (data.status === 200 && data.data) {
                    setCustomer(data.data)
                } else {
                    const errorMsg = data.message || 'Failed to load customer data'
                    setError(errorMsg)
                    toast.error(errorMsg)
                }
            } catch (error) {
                console.error('Error fetching customer data:', error)
                setError('Error connecting to server')
                toast.error('Error connecting to server')
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchCustomerData()
    }, [customerId])
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        )
    }
    
    if (error || !customer) {
        return (
            <div className="bg-black/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gold">Error Loading Customer</h2>
                    <button 
                        onClick={onBack} 
                        className="bg-black text-gold px-4 py-2 rounded hover:bg-gold hover:text-black transition-colors"
                    >
                        Back to Customers
                    </button>
                </div>
                <div className="text-center p-8 text-white bg-black/50 rounded-lg">
                    <p className="text-red-400 mb-4">{error || 'Customer not found'}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-gold text-black px-4 py-2 rounded hover:bg-white transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }
    
    // Group purchases by event
    const purchasesByEvent: Record<number, CustomerPurchase[]> = {}
    customer.purchases.forEach(purchase => {
        if (!purchasesByEvent[purchase.eventId]) {
            purchasesByEvent[purchase.eventId] = []
        }
        purchasesByEvent[purchase.eventId].push(purchase)
    })
    

    return (
        <div className="bg-black/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gold">Customer Details</h2>
                <button 
                    onClick={onBack} 
                    className="bg-black text-gold px-4 py-2 rounded hover:bg-gold hover:text-black transition-colors"
                >
                    Back to Customers
                </button>
            </div>
            
            <div className="bg-black rounded-lg overflow-hidden shadow-lg mb-8">
                <header className="bg-gold text-black font-bold text-xl p-3">
                    {customer.name}
                </header>
                <div className="p-4 text-white space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-400">Email:</p>
                            <p>{customer.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Phone:</p>
                            <p>{customer.phoneNumber || 'Not provided'}</p>
                        </div>
                    </div>
                    
                    {customer.notes && (
                        <div>
                            <p className="text-gray-400">Notes:</p>
                            <p className="bg-black/30 p-2 rounded">{customer.notes}</p>
                        </div>
                    )}
                    
                    <div>
                        <p className="text-gray-400">Status:</p>
                        <p>{customer.priorCustomer ? 'Returning Customer' : 'New Customer'}</p>
                    </div>
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-gold mb-4">Purchase History</h3>
            
            {Object.keys(purchasesByEvent).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(purchasesByEvent).map(([eventId, purchases]) => {
                        const event = purchases[0] // Use first purchase to get event details
                        return (
                            <div key={eventId} className="bg-black rounded-lg overflow-hidden shadow-lg">
                                <header className="bg-gold text-black font-bold text-xl p-3">
                                    {event.eventTitle} - {formatDate(new Date(event.eventDate))}
                                </header>
                                <div className="divide-y divide-gray-800">
                                    {purchases.map(purchase => (
                                        <div key={purchase.purchaseId} className="p-4 text-white">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">
                                                        {formatDate(new Date(purchase.ticketTime))} at {new Date(purchase.ticketTime).toLocaleString("en-us", {hour: 'numeric', minute: 'numeric'})}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        Purchased on {formatDate(new Date(purchase.purchaseDate))}
                                                    </p>
                                                </div>
                                                <div className="bg-gold/20 px-3 py-1 rounded text-gold font-bold">
                                                    {purchase.quantity} {purchase.quantity === 1 ? 'ticket' : 'tickets'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center p-8 text-white bg-black/50 rounded-lg">
                    No purchase history found for this customer.
                </div>
            )}
        </div>
    )
} 