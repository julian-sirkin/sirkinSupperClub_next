import { transporter } from "@/app/config/nodemailer";
import { NextResponse } from "next/server";
import { getCustomerByEmail } from "../queries/select";
import { createCustomer } from "../queries/insert";

export async function POST(request: Request) {
    const data = await request.json()
    
    const name: string = data?.name ?? 'unknown'
    const email: string = data?.email?.toLowerCase() ?? ''
    const phoneNumber: string = data?.phoneNumber ?? ''
    const comment: string = data?.comment ?? ''
    
    const emailHtml = `
    <main>
        <h1>New Contact Form Sumbmission</h1>
        <ul>
            <li>
                Name: ${name}
           </li>
           <li>
                Phone number: ${phoneNumber}
           </li>
           <li>
                email: ${email}
           </li>
           <li>
                <p>
                    Comment: ${comment}
                </p>
           </li>
        </ul>
    </main>
    `

    if (email) {
        const customerInDatabase = await getCustomerByEmail(email)
        if(customerInDatabase.length === 0) {
            
           const createdCustomer = await createCustomer({name, email, phoneNumber, priorCustomer: false})
        }
    }

    try {
        await transporter.sendMail({
            from: email ? email : 'sirkinsupperclub@gmail.com',
            to: 'sirkinsupperclub@gmail.com',
            subject: `${name} website form submission`,
            html: emailHtml
        })
        return NextResponse.json({status: 200})
    } catch(err) {
        return NextResponse.json({ status: 500, err})
    }
}