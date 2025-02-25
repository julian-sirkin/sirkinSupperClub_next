"use client";

import { useState } from "react";

export default function SyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setIsLoading(true);
    setMessage("Syncing events...");
    
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Sync completed successfully!");
      } else {
        setMessage(`Error: ${data.error || "Unknown error occurred"}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
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
        
        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes("Error") ? "bg-red-900/50 border border-red-500" : "bg-green-900/50 border border-green-500"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
} 