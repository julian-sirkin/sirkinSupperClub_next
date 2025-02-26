'use client'
import { useState, useEffect } from 'react'
import { formatDate } from '@/app/utils/formatDate'
import Link from 'next/link'

type CustomerPurchase = {
    purchaseId: number
    eventId: number
    eventTitle: string
    eventDate: number
    ticketTime: number
    quantity: number
    paid: boolean
    purchaseDate: number
}

type CustomerDetails = {
    id: number
    name: string
    email: string
    phoneNumber: string
    notes: string
    dietaryRestrictions: string
    purchases: CustomerPurchase[]
}

export const CustomerDetail = ({ customerId, onBack }: { customerId: number, onBack: () => void }) => {
    const [customer, setCustomer] = useState<CustomerDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCustomerDetails = async () => {
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
                
                if (data.status === 200) {
                    setCustomer(data.customer || null)
                } else {
                    const errorMsg = data.message || 'Failed to load customer details'
                    setError(errorMsg)
                }
            } catch (err) {
                console.error('Error fetching customer details:', err)
                setError('Error connecting to server')
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchCustomerDetails()
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
    
    const totalTickets = customer.purchases.reduce((sum, purchase) => sum + purchase.quantity, 0)
    const totalEvents = new Set(customer.purchases.map(p => p.eventId)).size

    return (
        <div className="bg-black/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gold">{customer.name}</h2>
                <button 
                    onClick={onBack} 
                    className="bg-black text-gold px-4 py-2 rounded hover:bg-gold hover:text-black transition-colors"
                >
                    Back to Customers
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-black/50 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-gold mb-4">Contact Information</h3>
                    <div className="space-y-2 text-white">
                        <p><span className="text-gray-400">Email:</span> {customer.email}</p>
                        <p><span className="text-gray-400">Phone:</span> {customer.phoneNumber || 'Not provided'}</p>
                        <p><span className="text-gray-400">Total Events:</span> {totalEvents}</p>
                        <p><span className="text-gray-400">Total Tickets:</span> {totalTickets}</p>
                    </div>
                </div>
                
                <div className="bg-black/50 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-gold mb-4">Preferences</h3>
                    <div className="space-y-4 text-white">
                        <div>
                            <h4 className="text-gray-400">Dietary Restrictions:</h4>
                            <p className="p-2 bg-black/30 rounded mt-1">
                                {customer.dietaryRestrictions || 'None specified'}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-gray-400">Notes:</h4>
                            <p className="p-2 bg-black/30 rounded mt-1">
                                {customer.notes || 'No notes'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-black/50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-gold mb-4">Purchase History</h3>
                
                {customer.purchases.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-black/70 rounded-lg overflow-hidden">
                            <thead className="bg-gold/80 text-black">
                                <tr>
                                    <th className="py-2 px-4 text-left">Event</th>
                                    <th className="py-2 px-4 text-left">Date</th>
                                    <th className="py-2 px-4 text-left">Time</th>
                                    <th className="py-2 px-4 text-left">Quantity</th>
                                    <th className="py-2 px-4 text-left">Status</th>
                                    <th className="py-2 px-4 text-left">Purchase Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {customer.purchases.map((purchase) => (
                                    <tr key={purchase.purchaseId} className="text-white">
                                        <td className="py-2 px-4">
                                            <Link 
                                                href={`/admin?view=event&id=${purchase.eventId}`}
                                                className="hover:text-gold transition-colors"
                                            >
                                                {purchase.eventTitle}
                                            </Link>
                                        </td>
                                        <td className="py-2 px-4">{formatDate(new Date(purchase.eventDate))}</td>
                                        <td className="py-2 px-4">
                                            {new Date(purchase.ticketTime).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-2 px-4">{purchase.quantity}</td>
                                        <td className="py-2 px-4">
                                            <span className={`inline-block px-2 py-1 rounded ${
                                                purchase.paid 
                                                    ? 'bg-green-800/30 text-green-400' 
                                                    : 'bg-red-800/30 text-red-400'
                                            }`}>
                                                {purchase.paid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">{formatDate(new Date(purchase.purchaseDate))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-4 text-gray-400">
                        No purchase history found.
                    </div>
                )}
            </div>
        </div>
    )
} 