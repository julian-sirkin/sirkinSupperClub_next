import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: false,
    auth: {
        user: process.env.GMAIL_FROM,
        pass: process.env.GMAIL_PASSWORD
    }
})