import { Id, toast } from 'react-toastify';

/**
 * Helper function to sync events from Contentful to the database
 * @param onComplete Optional callback function to run after sync completes (only on success)
 * @returns Promise that resolves when sync completes
 */
export const syncEvents = async (onComplete?: () => void): Promise<boolean> => {
  // Create loading toast and store its ID
  const toastId = toast.loading("Syncing events from Contentful...");
  
  try {
    console.log("Starting event sync...");
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log("Sync response:", data);
    
    if (response.ok) {
      toast.update(toastId, {
        render: "Events synchronized successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });
      
      // Wait a moment before calling onComplete (only on success)
      if (onComplete) {
        toast.info("Page will refresh in 2 seconds...", {
          autoClose: 2000
        });
        setTimeout(() => {
          try {
            onComplete();
          } catch (error) {
            console.error("Error in onComplete callback:", error);
            // Ensure we still update UI even if callback fails
            window.location.reload();
          }
        }, 2500);
      } else {
        // If no callback provided, still reset UI
        toast.info("Sync complete. You may need to refresh the page to see changes.", {
          autoClose: 5000
        });
      }
      
      return true;
    } else {
      console.error("Sync failed:", data);
      
      // Format error details for better visibility
      const errorDetails = data.details 
        ? typeof data.details === 'object' 
          ? JSON.stringify(data.details, null, 2) 
          : String(data.details)
        : '';
      
      // Show a more detailed error toast
      toast.update(toastId, {
        render: `Error: ${data.error || 'Failed to sync events'}`,
        type: "error",
        isLoading: false,
        autoClose: false, // Keep error visible until manually closed
      });
      
      // Display additional error details in a separate toast if available
      if (errorDetails) {
        toast.error(`Error Details: ${errorDetails}`, {
          autoClose: false // Keep error visible until manually closed
        });
      }
      
      return false;
    }
  } catch (error) {
    console.error("Error during sync:", error);
    
    // Show more detailed error info
    const errorMessage = error instanceof Error 
      ? `${error.message}\n${error.stack || ''}` 
      : String(error);
    
    toast.update(toastId, {
      render: "Error connecting to server",
      type: "error",
      isLoading: false,
      autoClose: false, // Keep error visible until manually closed
    });
    
    // Additional toast with error details
    toast.error(`Error details: ${errorMessage}`, {
      autoClose: false // Keep error visible until manually closed
    });
    
    return false;
  }
}; 