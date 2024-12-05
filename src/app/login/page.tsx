"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Send password to the API to verify
    const res = await fetch('api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  
    if (res.status === 200) {
      router.push('/admin'); // Redirect to admin page
    } else {
      setPasswordError('Invalid password');
    }
  };

  return (
    <div className='bg-black p-2 text-white h-screen'>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin} className='w-1/2 m-auto p-4 border-2 border-gold flex gap-6'>
        <input
          className='text-black'
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className='p-2 bg-gold hover:bg-white hover:text-gold' type="submit">Login</button>
        {passwordError && <p className='text-red-600 p-2'>{passwordError}</p>}
      </form>
     
    </div>
  );
}