"use client";

import React from 'react';

// Define the props interface for the UI component
interface LoginFormUIProps {
  password: string;
  passwordError: string;
  isPending: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

// This is the purely presentational component
export default function LoginFormUI({
  password,
  passwordError,
  isPending,
  onPasswordChange,
  onSubmit,
}: LoginFormUIProps) {
  return (
    // Keep the same outer div structure for centering from the original LoginForm
    <div className="flex flex-col items-center justify-center w-full">
       <h1 className="text-3xl font-bold text-gold mb-6">Admin Login</h1>
      <form 
        onSubmit={onSubmit} 
        className="w-full max-w-sm p-8 bg-black/30 rounded-lg shadow-md border border-gold"
      >
        <div className="mb-4">
          <label htmlFor="password" className="block text-gold text-sm font-bold mb-2">
            Password
          </label>
          <input
            id="password"
            className="shadow appearance-none border border-gold rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline bg-white"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={onPasswordChange}
            required
            disabled={isPending}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            className={`w-full p-3 rounded-lg shadow-md transition-colors ease-in-out duration-150 ${
              isPending 
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                : 'bg-gold text-black hover:bg-white hover:text-gold'
            }`} 
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Logging In...' : 'Login'}
          </button>
        </div>

        {passwordError && (
          <p className='text-red-500 text-xs italic mt-4 text-center'>{passwordError}</p>
        )}
      </form>
    </div>
  );
} 