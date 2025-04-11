"use client";
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import LoginFormUI from './LoginFormUI'; // Import the UI component
import { loginUser } from '@/app/lib/apiClient'; // Import the centralized API function

// This is the container component
export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(''); // Reset error on new submission

    startTransition(async () => {
      try {
        // Use the imported function
        const res = await loginUser(password); 

        if (res.ok) { 
          router.push('/admin');
        } else {
          // Handle potential errors when parsing JSON
          let errorMessage = 'Invalid password';
          try {
              const errorData = await res.json();
              errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
              console.error("Failed to parse error response:", parseError);
          }
          setPasswordError(errorMessage);
        }
      } catch (error) {
        console.error("Login failed:", error);
        // Handle network errors or errors from loginUser itself
        setPasswordError('An unexpected error occurred. Please check your connection and try again.');
      }
    });
  };

  // Render the UI component, passing state and handlers as props
  return (
    <LoginFormUI
      password={password}
      passwordError={passwordError}
      isPending={isPending}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleLoginSubmit}
    />
  );
} 