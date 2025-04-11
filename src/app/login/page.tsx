"use client"
// Remove useState import if no longer needed
// import { useState } from 'react'; 
// Remove useRouter import if no longer needed here (it's used in LoginForm)
// import { useRouter } from 'next/navigation';
import LoginForm from '@/app/components/LoginForm/LoginForm'; // Import the new component

export default function Login() {
  // Remove useState hooks and handleLogin function - they are now in LoginForm

  return (
    // Update the outer div styling - remove centering, let LoginForm handle it
    // Add min-h-screen to ensure background covers the page
    <div className='bg-black text-white min-h-screen flex items-center justify-center'> 
      {/* Render the new LoginForm component */}
      <LoginForm /> 
    </div>
  );
}