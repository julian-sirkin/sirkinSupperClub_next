"use client";

import { useState } from "react";
import { ToastContainer } from "react-toastify";
import { syncEvents } from "@/app/utils/syncEvents";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from "react-toastify";

export default function SyncPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
        // Call sync with a direct page reload callback
        const success = await syncEvents(() => {
            console.log("Refreshing page after successful sync");
            window.location.reload();
        });
        
        if (!success) {
            console.log("Sync failed, resetting loading state");
            setIsLoading(false);
        } else {
            // Add a backup timeout to reset state if page doesn't refresh
            setTimeout(() => {
                if (isLoading) {
                    setIsLoading(false);
                    toast.info("Sync completed. Refresh the page to see changes.");
                }
            }, 5000);
        }
    } catch (error) {
        console.error("Error in sync process:", error);
        setIsLoading(false);
        toast.error("Unexpected error during sync process");
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