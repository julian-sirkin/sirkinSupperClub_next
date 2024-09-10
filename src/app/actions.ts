"use server"

import { redirect } from "next/navigation"

export const redirectToEvents = async () => {
    redirect('/events')
}