import { db } from "@/db";
import { customersTable, InsertCustomer } from "@/db/schema";


export async function createCustomer(data: InsertCustomer) {
    console.log('inside in createCustomer')
    await db.insert(customersTable).values(data)
}