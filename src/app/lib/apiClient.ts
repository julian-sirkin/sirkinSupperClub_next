// Centralized place for client-side API calls

export const loginUser = async (password: string) => {
    // The fetch call logic previously in LoginForm.tsx
    const res = await fetch('/api/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    });

    // Return the response object. The caller will handle checking res.ok and parsing JSON.
    return res;
};

// You can add other client-side fetch functions here in the future
// e.g., export const fetchEvents = async () => { ... }; 