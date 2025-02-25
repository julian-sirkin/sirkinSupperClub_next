'use client'
import { useState, useEffect } from 'react'
import { CustomerDetail } from '../components/CustomerDetail/CustomerDetail'
import { toast } from 'react-toastify'

type Customer = {
    id: number
    name: string
    email: string
    phoneNumber: string | null
    purchaseCount: number
}

export default function CustomerSection() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    
    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoading(true)
            setError(null)
            
            try {
                const response = await fetch('/api/getAllCustomers')
                const data = await response.json()
                
                if (data.status === 200 && data.data) {
                    setCustomers(data.data)
                } else {
                    const errorMsg = data.message || 'Failed to load customers'
                    setError(errorMsg)
                    toast.error(errorMsg)
                }
            } catch (error) {
                console.error('Error fetching customers:', error)
                setError('Error connecting to server')
                toast.error('Error connecting to server')
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchCustomers()
    }, [])
    
    // Check URL for customer ID on initial load
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const customerId = params.get('id')
            if (customerId && !isNaN(Number(customerId))) {
                setSelectedCustomerId(Number(customerId))
            }
        }
    }, [])
    
    const filteredCustomers = searchTerm 
        ? customers.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
        : customers
    
    if (selectedCustomerId) {
        return <CustomerDetail customerId={selectedCustomerId} onBack={() => setSelectedCustomerId(null)} />
    }
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        )
    }
    
    if (error) {
        return (
            <div className="text-center p-8 text-white bg-black/50 rounded-lg">
                <p className="text-red-400 mb-4">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="bg-gold text-black px-4 py-2 rounded hover:bg-white transition-colors"
                >
                    Retry
                </button>
            </div>
        )
    }
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gold">Customers</h2>
            
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full p-3 bg-black/50 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-gold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {filteredCustomers.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-black/50 rounded-lg overflow-hidden">
                        <thead className="bg-gold text-black">
                            <tr>
                                <th className="py-3 px-4 text-left">Name</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-left">Phone</th>
                                <th className="py-3 px-4 text-left">Purchases</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="text-white hover:bg-black/70">
                                    <td className="py-3 px-4">{customer.name}</td>
                                    <td className="py-3 px-4">{customer.email}</td>
                                    <td className="py-3 px-4">{customer.phoneNumber || 'N/A'}</td>
                                    <td className="py-3 px-4">{customer.purchaseCount}</td>
                                    <td className="py-3 px-4">
                                        <button 
                                            onClick={() => setSelectedCustomerId(customer.id)} 
                                            className="bg-gold text-black px-3 py-1 rounded hover:bg-white transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-8 text-white bg-black/50 rounded-lg">
                    {searchTerm ? 'No customers match your search.' : 'No customers found.'}
                </div>
            )}
        </div>
    )
}
