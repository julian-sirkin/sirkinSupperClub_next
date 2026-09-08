'use client'
import { CustomerList } from '../components/CustomerList/CustomerList'
import { CustomerDetail } from '../components/CustomerDetail/CustomerDetail'

const CustomerSection = ({ selectedCustomerId }: { selectedCustomerId: number | null }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gold">Customers</h2>
            
            {selectedCustomerId ? (
                <CustomerDetail customerId={selectedCustomerId} />
            ) : (
                <CustomerList />
            )}
        </div>
    )
}

export default CustomerSection
