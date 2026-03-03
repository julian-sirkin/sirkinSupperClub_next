import { transporter } from "@/app/config/nodemailer";
import { SuccessEmailProps } from "../api.types";


const formatTicketDateTime = (
    ticketTime: string | Date,
    clientTimeZone?: string
) => {
    const parsedTime = new Date(ticketTime);

    if (Number.isNaN(parsedTime.getTime())) {
        return String(ticketTime);
    }

    const timezoneOptions = clientTimeZone
        ? { timeZone: clientTimeZone }
        : {};

    try {
        return parsedTime.toLocaleString("en-us", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            ...timezoneOptions,
        });
    } catch {
        return parsedTime.toLocaleString("en-us", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }
};

const getTicketLineTotal = (ticket: SuccessEmailProps["tickets"][number]) => {
    const ticketTotal = ticket.price * ticket.quantity;
    const addonTotal =
        ticket.selectedAddonContentfulId && (ticket.addonQuantity ?? 0) > 0
            ? (ticket.selectedAddonPrice ?? 0) * (ticket.addonQuantity ?? 0)
            : 0;

    return ticketTotal + addonTotal;
};

const getOrderTotal = (tickets: SuccessEmailProps["tickets"]) => {
    return tickets.reduce((total, ticket) => total + getTicketLineTotal(ticket), 0);
};

export const successEmail = async ({customer, tickets, clientTimeZone}: SuccessEmailProps) => {

    const customerEmailHtml = `
    <main style="background:#000000;color:#ffffff;font-family:Arial,sans-serif;padding:24px;">
        <section style="max-width:680px;margin:0 auto;border:1px solid #d4af37;border-radius:12px;padding:24px;background:#111111;">
            <h1 style="margin:0 0 16px 0;color:#d4af37;">Order Confirmation</h1>
            <p>Dear ${customer.name},</p>
            <p>Thank you so much for your order! This is my side passion project, and it's super fun.
            Without people like you willing to take a leap, I couldn't do this. I truly appreciate your support.
            I look forward to sharing some creative food with you, some of what I enjoy in hospitality, and to give you the chance to meet some awesome,
            like-minded people.</p>
            <p>Here are the details of your purchase:</p>
            <ul style="padding-left:18px;">
                ${tickets.map(ticket => `
                    <li style="margin-bottom:12px;">
                        Event: ${ticket.title} <br>
                        Date: ${formatTicketDateTime(ticket.time, clientTimeZone)} <br>
                        Quantity: ${ticket.quantity} <br>
                        ${ticket.selectedAddonContentfulId && (ticket.addonQuantity ?? 0) > 0 ? `Addon: ${ticket.selectedAddonTitle} (x${ticket.addonQuantity})<br>` : ''}
                        Line Total: $${getTicketLineTotal(ticket).toFixed(2)}
                    </li>
                `).join('')}
            </ul>
            <p><strong style="color:#d4af37;">Total Price: $${getOrderTotal(tickets).toFixed(2)}</strong></p>
            <p>Please remember to pay via Venmo if you haven't already. You can send the payment to <a href="https://venmo.com/julian-sirkin" style="color:#d4af37;">@julian-sirkin</a>.</p>
            <p>Don't forget to bring anything outside of water and coffee.</p>
            <p>If you have any questions, feel free to contact us at <a href="mailto:sirkinsupperclub@gmail.com" style="color:#d4af37;">sirkinsupperclub@gmail.com</a> or on Instagram <a href="https://instagram.com/julian.sirkin" style="color:#d4af37;">@julian.sirkin</a>.</p>
        </section>
    </main>
    `;

    const adminEmailHtml = `
    <main>
        <h1>New Order Received</h1>
        <p>Customer Information:</p>
        <ul>
            <li>Name: ${customer.name}</li>
            <li>Email: ${customer.email}</li>
            <li>Phone Number: ${customer.phoneNumber}</li>
            <li>Comment: ${customer.notes}</li>
            <li>Dietary Restrictions: ${customer.dietaryRestrictions}</li>
        </ul>
        <p>Tickets Purchased:</p>
        <ul>
            ${tickets.map(ticket => `
                <li>
                    Event: ${ticket.title} <br>
                    Date: ${formatTicketDateTime(ticket.time, clientTimeZone)} <br>
                    Quantity: ${ticket.quantity} <br>
                    ${ticket.selectedAddonContentfulId && (ticket.addonQuantity ?? 0) > 0 ? `Addon: ${ticket.selectedAddonTitle} (x${ticket.addonQuantity})<br>` : ''}
                    Line Total: $${getTicketLineTotal(ticket).toFixed(2)}
                </li>
            `).join('')}
        </ul>
        <p><strong>Total Price: $${getOrderTotal(tickets).toFixed(2)}</strong></p>

    </main>
    `;

    try {
        await transporter.sendMail({
            from: 'sirkinsupperclub@gmail.com',
            to: 'sirkinsupperclub@gmail.com',
            subject: `New Order from ${customer.name}`,
            html: adminEmailHtml
        });

        await transporter.sendMail({
            from: 'sirkinsupperclub@gmail.com',
            to: customer.email,
            subject: 'Your Order Confirmation',
            html: customerEmailHtml
        });
        return {emailSuccessfully: true}
    } catch (err) {
        return {emailSuccessfully: false}
        console.error('Error sending emails:', err);
    }

}