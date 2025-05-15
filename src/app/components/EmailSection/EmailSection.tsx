'use client';

import { useState, useEffect } from 'react';
import { EmailComposer } from '../EmailComposer/EmailComposer';
import { toast } from 'react-toastify';

export function EmailSection() {
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const response = await fetch('/api/getCustomerCount');
        const data = await response.json();
        
        if (response.ok) {
          setCustomerCount(data.count);
        } else {
          toast.error('Failed to load customer count');
        }
      } catch (error) {
        console.error('Error fetching customer count:', error);
        toast.error('Error connecting to server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerCount();
  }, []);

  const handleSendEmail = async (subject: string, content: string) => {
    try {
      const response = await fetch('/api/sendBulkEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          content,
          type: 'all' // This indicates we're sending to all customers
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Let the EmailComposer handle the error
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gold/30 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gold">Email All Customers</h2>
        <p className="text-gray-400 mt-2">
          Send an email to all customers in the database
        </p>
      </div>

      <EmailComposer
        onSend={handleSendEmail}
        recipientCount={customerCount}
        recipientDescription="customers"
      />
    </div>
  );
} 