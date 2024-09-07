import { transporter } from "@/app/config/nodemailer";
import { SuccessEmailProps } from "../api.types";


export const successEmail = async ({customer, tickets}: SuccessEmailProps) => {

    const customerEmailHtml = `
    <main style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #4CAF50;">Order Confirmation</h1>
        <p>Dear ${customer.name},</p>
        <p>Thank you so much for your order! This is my side passion project, and it's super fun. 
        Without people like you willing to take a leap, I couldn't do this. I truly appreciate your support. 
        I look forward to sharing some creative food with you, some of what I enjoy in hospitality, and to give you the chance to meet some awesome, 
        like-minded people.</p>
        <p>Here are the details of your purchase:</p>
        <ul>
            ${tickets.map(ticket => `
                <li>
                    Event: ${ticket.title} <br>
                    Date: ${ticket.time.toLocaleString("en-us", {
              hour: "numeric",
              minute: "numeric",
            })} <br>
                    Quantity: ${ticket.quantity}
                </li>
            `).join('')}
        </ul>
        <p><strong>Total Price: $${tickets.reduce((total, ticket) => total + ticket.price * ticket.quantity, 0).toFixed(2)}</strong></p>
        <p>Please remember to pay via Venmo if you haven't already. You can send the payment to <a href="https://venmo.com/julian-sirkin" style="color: #4CAF50;">@julian-sirkin</a>.</p>
        <p>Don't forget to bring anything outside of water and coffee.</p>
        <p>If you have any questions, feel free to contact us at <a href="mailto:sirkinsupperclub@gmail.com" style="color: #4CAF50;">sirkinsupperclub@gmail.com</a> or on Instagram <a href="https://instagram.com/julian.sirkin" style="color: #4CAF50;">@julian.sirkin</a>.</p>
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
                    Date: ${ticket.time.toLocaleString("en-us", {
              hour: "numeric",
              minute: "numeric",
            })} <br>
                    Quantity: ${ticket.quantity}
                </li>
            `).join('')}
        </ul>
        <p><strong>Total Price: $${tickets.reduce((total, ticket) => total + ticket.price * ticket.quantity, 0).toFixed(2)}</strong></p>

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