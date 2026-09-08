"use client";

import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { syncEvents } from "@/app/utils/syncEvents";
import 'react-toastify/dist/ReactToastify.css';

export default function SyncPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const success = await syncEvents();
      if (!success) {
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (error) {
      console.error("Error in sync process:", error);
      toast.error("Unexpected error during sync process");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <ToastContainer position="top-right" />
      <h1 className="text-3xl font-bold text-gold mb-6">Admin Sync</h1>
      
      <div className="bg-black/80 border border-gold p-6 rounded-lg max-w-md mx-auto">
        <p className="mb-4">Sync events from Contentful to the database.</p>
        
        <button
          onClick={handleSync}
          disabled={isLoading}
          className="w-full py-3 bg-gold text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Syncing..." : "Sync Events"}
        </button>
      </div>
    </div>
  );
}
