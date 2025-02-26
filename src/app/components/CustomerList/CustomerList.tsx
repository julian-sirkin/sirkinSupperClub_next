'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '@/app/utils/formatDate';

type Customer = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  purchaseCount: number;
  lastPurchase: number | null;
};

export const CustomerList = ({ onSelectCustomer }: { onSelectCustomer: (id: number) => void }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/getAllCustomers');
        const data = await response.json();
        
        if (data.status === 200) {
          setCustomers(data.customers || []);
        } else {
          setError(data.message || 'Failed to load customers');
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Error connecting to server');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
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
    );
  }

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          className="w-full p-3 bg-black/50 border border-gray-700 rounded text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black/50 rounded-lg overflow-hidden">
          <thead className="bg-gold text-black">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Purchases</th>
              <th className="py-3 px-4 text-left">Last Purchase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="text-white hover:bg-black/70 cursor-pointer"
                  onClick={() => onSelectCustomer(customer.id)}
                >
                  <td className="py-3 px-4 font-medium">{customer.name}</td>
                  <td className="py-3 px-4">{customer.email}</td>
                  <td className="py-3 px-4">{customer.phoneNumber || 'N/A'}</td>
                  <td className="py-3 px-4">{customer.purchaseCount}</td>
                  <td className="py-3 px-4">
                    {customer.lastPurchase 
                      ? formatDate(new Date(customer.lastPurchase)) 
                      : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  {searchTerm ? 'No customers match your search.' : 'No customers found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 