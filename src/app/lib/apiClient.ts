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

export const updatePaymentStatus = async (purchaseId: number, paid: boolean) => {
    const res = await fetch('/api/updatePaymentStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId, paid }),
    });
    return res; // Caller handles response
};

export const claimTickets = async (data: any) => { // Use a more specific type if available
    const res = await fetch('/api/claimTickets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Assuming data is already structured correctly
    });
    return res; // Caller handles response
};

export const refundTickets = async (orderId: number, ticketId: number, quantity: number) => {
    const res = await fetch('/api/refundTickets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({ orderId, ticketId, quantity })
    });
    return res; // Caller handles response
};

export const getAdminEvent = async (eventId: number) => {
    const res = await fetch('/api/getAdminEvent', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({eventId})
    });
    return res; // Caller handles response
};

export const getAllCustomers = async () => {
    const res = await fetch('/api/getAllCustomers');
    return res; // Caller handles response
};

export const getCustomerDetails = async (customerId: number) => {
    const res = await fetch('/api/getCustomerDetails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
    });
    return res; // Caller handles response
};

// You can add other client-side fetch functions here in the future
// e.g., export const fetchEvents = async () => { ... }; 