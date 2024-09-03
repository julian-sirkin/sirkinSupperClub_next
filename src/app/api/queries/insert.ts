import { db } from "@/db";
import { customersTable, InsertCustomer } from "@/db/schema";


export async function createCustomer(data: InsertCustomer) {
    await db.insert(customersTable).values(data)
}