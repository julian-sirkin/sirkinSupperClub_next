'use client'
import { useState, useEffect } from 'react'
import { CustomerList } from '../components/CustomerList/CustomerList'
import { CustomerDetail } from '../components/CustomerDetail/CustomerDetail'

interface CustomerSectionProps {
    selectedCustomerId: number | null;
    onCustomerSelect: (customerId: number | null) => void;
    onEventClick?: (eventId: number) => void;
}

const CustomerSection = ({ selectedCustomerId, onCustomerSelect, onEventClick }: CustomerSectionProps) => {
    const handleSelectCustomer = (id: number) => {
        onCustomerSelect(id);
    }
    
    const handleBack = () => {
        onCustomerSelect(null);
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gold">Customers</h2>
            
            {selectedCustomerId ? (
                <CustomerDetail 
                    customerId={selectedCustomerId} 
                    onBack={handleBack}
                    onEventClick={onEventClick}
                />
            ) : (
                <CustomerList onSelectCustomer={handleSelectCustomer} />
            )}
        </div>
    )
}

export default CustomerSection
