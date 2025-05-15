'use client';

import { useState } from 'react';
import { EmailComposer } from '../EmailComposer/EmailComposer';
import { toast } from 'react-toastify';

export function TestEmailSection() {
  const [recipients, setRecipients] = useState('');

  const handleSendEmail = async (subject: string, content: string) => {
    try {
      // Split and trim email addresses
      const emailList = recipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emailList.length === 0) {
        toast.error('Please enter at least one email address');
        return;
      }

      const response = await fetch('/api/sendBulkEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          content,
          type: 'specific',
          recipients: emailList
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gold/30 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gold">Send Email</h2>
        <p className="text-gray-400 mt-2">
          Send an email to specific recipients
        </p>
      </div>

      <div className="space-y-2 mb-6">
        <label htmlFor="recipients" className="block text-gold font-semibold">
          Recipients
        </label>
        <input
          id="recipients"
          type="text"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          className="w-full p-2 bg-black border border-gold/30 rounded text-white focus:outline-none focus:border-gold"
          placeholder="Enter email addresses (comma-separated)"
        />
        <p className="text-gray-400 text-sm">
          Enter multiple email addresses separated by commas
        </p>
      </div>

      <EmailComposer
        onSend={handleSendEmail}
        recipientCount={recipients.split(',').filter(email => email.trim().length > 0).length}
        recipientDescription="recipients"
      />
    </div>
  );
} 