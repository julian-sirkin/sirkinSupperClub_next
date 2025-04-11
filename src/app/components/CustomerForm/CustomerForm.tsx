import { CustomerFormData, ToastFunction } from '@/types';
import { useState } from 'react';

type CustomerFormProps = {
  initialData?: CustomerFormData;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onSuccess?: ToastFunction;
  onError?: ToastFunction;
};

export const CustomerForm = ({ 
  initialData = { name: '', email: '', phoneNumber: '', dietaryRestrictions: '', notes: '' },
  onSubmit,
  onSuccess,
  onError
}: CustomerFormProps) => {
  // Component implementation
}; 