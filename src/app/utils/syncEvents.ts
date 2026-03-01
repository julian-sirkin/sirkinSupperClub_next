import { Id, toast } from 'react-toastify';

function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
}

/**
 * Helper function to sync events from Contentful to the database
 * @param onComplete Optional callback function to run after sync completes (only on success)
 * @returns Promise that resolves when sync completes
 */
export const syncEvents = async (onComplete?: () => void): Promise<boolean> => {
  const syncStartTime = Date.now();
  const syncId = `sync-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log("=== CLIENT: Starting event sync ===");
  console.log(`Sync ID: ${syncId}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`onComplete callback provided: ${onComplete ? 'YES' : 'NO'}`);
  console.log(`User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}`);
  console.log(`Window Location: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`);
  
  // Create loading toast and store its ID
  const toastId = toast.loading("Syncing events from Contentful...");
  
  try {
    console.log("=== CLIENT: Preparing fetch request ===");
    console.log(`Sync ID: ${syncId}`);
    console.log(`Request URL: /api/sync`);
    console.log(`Request Method: POST`);
    console.log(`Request Headers: ${safeStringify({
      'Content-Type': 'application/json'
    })}`);
    
    const fetchStartTime = Date.now();
    console.log(`Fetch start time: ${new Date(fetchStartTime).toISOString()}`);
    
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const fetchDuration = Date.now() - fetchStartTime;
    console.log("=== CLIENT: Fetch completed ===");
    console.log(`Sync ID: ${syncId}`);
    console.log(`Fetch duration: ${fetchDuration}ms`);
    console.log(`Response status: ${response.status}`);
    console.log(`Response statusText: ${response.statusText}`);
    console.log(`Response ok: ${response.ok}`);
    console.log(`Response headers: ${safeStringify(Object.fromEntries(response.headers.entries()))}`);
    
    let data;
    const parseStartTime = Date.now();
    try {
      const responseText = await response.text();
      console.log("=== CLIENT: Response body (raw) ===");
      console.log(`Sync ID: ${syncId}`);
      console.log(`Response text length: ${responseText.length} characters`);
      console.log(`Response text preview (first 500 chars): ${responseText.substring(0, 500)}`);
      
      try {
        data = JSON.parse(responseText);
        const parseDuration = Date.now() - parseStartTime;
        console.log(`JSON parse duration: ${parseDuration}ms`);
        console.log("=== CLIENT: Response parsed successfully ===");
      } catch (parseError) {
        console.error("=== CLIENT: JSON parse error ===");
        console.error(`Sync ID: ${syncId}`);
        console.error(`Parse error: ${safeStringify(parseError)}`);
        console.error(`Response text that failed to parse: ${responseText}`);
        throw new Error(`Failed to parse response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
    } catch (textError) {
      console.error("=== CLIENT: Failed to read response text ===");
      console.error(`Sync ID: ${syncId}`);
      console.error(`Error reading response: ${safeStringify(textError)}`);
      throw textError;
    }
    
    console.log("=== CLIENT: Sync response data ===");
    console.log(`Sync ID: ${syncId}`);
    console.log(`Response status: ${response.status}`);
    console.log(`Response data: ${safeStringify(data)}`);
    console.log(`Response data keys: ${Object.keys(data).join(', ')}`);
    
    // Check for partial failures (207 status or hasPartialFailures flag)
    const isPartialFailure = response.status === 207 || data.hasPartialFailures;
    console.log("=== CLIENT: Evaluating response status ===");
    console.log(`Sync ID: ${syncId}`);
    console.log(`Response ok: ${response.ok}`);
    console.log(`Response status: ${response.status}`);
    console.log(`Is partial failure: ${isPartialFailure}`);
    console.log(`data.hasPartialFailures: ${data.hasPartialFailures}`);
    
    if (response.ok || isPartialFailure) {
      if (isPartialFailure) {
        console.log("=== CLIENT: Handling partial failure ===");
        console.log(`Sync ID: ${syncId}`);
        console.log(`Total sync duration: ${Date.now() - syncStartTime}ms`);
        console.log(`Partial failure details: ${safeStringify(data.details || data.error || data.errors || 'No details provided')}`);
        
        // Show warning for partial failure
        toast.update(toastId, {
          render: "Sync completed with some errors. Check console for details.",
          type: "warning",
          isLoading: false,
          autoClose: 5000
        });
        
        // Log the errors
        if (data.details) {
          const errorDetails = Array.isArray(data.details) 
            ? data.details.join('\n')
            : safeStringify(data.details);
          console.error("=== CLIENT: Partial Sync Errors ===");
          console.error(`Sync ID: ${syncId}`);
          console.error(`Errors: ${errorDetails}`);
        }
        if (data.data) {
          console.log("=== CLIENT: Partial failure sync results ===");
          console.log(`Sync ID: ${syncId}`);
          console.log(`Sync results: ${safeStringify(data.data)}`);
        }
      } else {
        console.log("=== CLIENT: Full success ===");
        console.log(`Sync ID: ${syncId}`);
        console.log(`Total sync duration: ${Date.now() - syncStartTime}ms`);
        if (data.data) {
          console.log(`Sync results: ${safeStringify(data.data)}`);
        }
        
        toast.update(toastId, {
          render: "Events synchronized successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
      }
      
      // Wait a moment before calling onComplete (only on full success, not partial failures)
      if (onComplete && !isPartialFailure) {
        console.log("=== CLIENT: Preparing to call onComplete callback ===");
        console.log(`Sync ID: ${syncId}`);
        toast.info("Page will refresh in 2 seconds...", {
          autoClose: 2000
        });
        setTimeout(() => {
          try {
            console.log("=== CLIENT: Executing onComplete callback ===");
            console.log(`Sync ID: ${syncId}`);
            onComplete();
            console.log("=== CLIENT: onComplete callback executed successfully ===");
            console.log(`Sync ID: ${syncId}`);
          } catch (error) {
            console.error("=== CLIENT: Error in onComplete callback ===");
            console.error(`Sync ID: ${syncId}`);
            console.error(`Callback error: ${safeStringify(error)}`);
            console.error(`Error message: ${error instanceof Error ? error.message : String(error)}`);
            console.error(`Error stack: ${error instanceof Error ? error.stack : 'N/A'}`);
            // Ensure we still update UI even if callback fails
            console.log("=== CLIENT: Falling back to window.location.reload() ===");
            window.location.reload();
          }
        }, 2500);
      } else if (!isPartialFailure) {
        console.log("=== CLIENT: No onComplete callback, showing info toast ===");
        console.log(`Sync ID: ${syncId}`);
        // If no callback provided, still reset UI
        toast.info("Sync complete. You may need to refresh the page to see changes.", {
          autoClose: 5000
        });
      }
      
      console.log("=== CLIENT: Sync completed (returning true) ===");
      console.log(`Sync ID: ${syncId}`);
      console.log(`Total sync duration: ${Date.now() - syncStartTime}ms`);
      // Return true for both success and partial failure (so UI doesn't show as failed)
      // But the toast will indicate if there were issues
      return true;
    } else {
      console.error("=== CLIENT: Sync failed ===");
      console.error(`Sync ID: ${syncId}`);
      console.error(`Total sync duration: ${Date.now() - syncStartTime}ms`);
      console.error(`Response status: ${response.status}`);
      console.error(`Response statusText: ${response.statusText}`);
      console.error(`Error data: ${safeStringify(data)}`);
      console.error(`Error data keys: ${Object.keys(data).join(', ')}`);
      
      // Format error details for better visibility
      const errorDetails = data.details 
        ? typeof data.details === 'object' 
          ? safeStringify(data.details)
          : String(data.details)
        : '';
      
      console.error("=== CLIENT: Error details formatted ===");
      console.error(`Sync ID: ${syncId}`);
      console.error(`Error message: ${data.error || 'Failed to sync events'}`);
      console.error(`Error details: ${errorDetails || 'No additional details'}`);
      if (data.stack) {
        console.error(`Error stack: ${data.stack}`);
      }
      
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
      
      console.error("=== CLIENT: Sync failed (returning false) ===");
      console.error(`Sync ID: ${syncId}`);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const totalDuration = Date.now() - syncStartTime;
    
    console.error("=== CLIENT: Exception caught during sync ===");
    console.error(`Sync ID: ${syncId}`);
    console.error(`Total duration before error: ${totalDuration}ms`);
    console.error(`Error name: ${errorName}`);
    console.error(`Error message: ${errorMessage}`);
    console.error(`Error stack: ${errorStack || 'No stack trace available'}`);
    console.error(`Full error object: ${safeStringify(error)}`);
    console.error(`Error type: ${typeof error}`);
    console.error(`Error constructor: ${error?.constructor?.name || 'N/A'}`);
    
    if (error instanceof TypeError) {
      console.error("=== CLIENT: TypeError details ===");
      console.error(`Sync ID: ${syncId}`);
      console.error(`This is a TypeError - likely a network or parsing issue`);
    } else if (error instanceof SyntaxError) {
      console.error("=== CLIENT: SyntaxError details ===");
      console.error(`Sync ID: ${syncId}`);
      console.error(`This is a SyntaxError - likely a JSON parsing issue`);
    } else if (error instanceof Error) {
      console.error("=== CLIENT: Generic Error details ===");
      console.error(`Sync ID: ${syncId}`);
      console.error(`This is a generic Error`);
    }
    
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
    
    console.error("=== CLIENT: Exception handled (returning false) ===");
    console.error(`Sync ID: ${syncId}`);
    return false;
  }
}; 