'use client'
import { useState, useEffect } from 'react'
import { CustomerList } from '../components/CustomerList/CustomerList'
import { CustomerDetail } from '../components/CustomerDetail/CustomerDetail'

const CustomerSection = () => {
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
    
    // Check URL for customer ID on initial load
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const customerId = params.get('id')
            if (customerId) {
                setSelectedCustomerId(Number(customerId))
            }
        }
    }, [])
    
    const handleSelectCustomer = (id: number) => {
        setSelectedCustomerId(id)
        // Update URL without reloading the page
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.set('id', id.toString())
            window.history.pushState({}, '', url)
        }
    }
    
    const handleBack = () => {
        setSelectedCustomerId(null)
        // Update URL without reloading the page
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.delete('id')
            window.history.pushState({}, '', url)
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gold">Customers</h2>
            
            {selectedCustomerId ? (
                <CustomerDetail 
                    customerId={selectedCustomerId} 
                    onBack={handleBack} 
                />
            ) : (
                <CustomerList onSelectCustomer={handleSelectCustomer} />
            )}
        </div>
    )
}

export default CustomerSection
