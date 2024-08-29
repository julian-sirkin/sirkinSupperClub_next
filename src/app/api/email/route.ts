import { transporter } from "@/app/config/nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const data = await request.json()
    
    const name = data?.name ?? 'unknown'
    const email = data?.email ?? ''
    const phoneNumber = data?.phoneNumber ?? ''
    const comment = data?.comment ?? ''
 
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