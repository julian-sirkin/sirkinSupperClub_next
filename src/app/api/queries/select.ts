import { db } from "@/db";
import { customersTable, SelectCustomer } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCustomerByEmail(email: SelectCustomer['email']){
return db.select().from(customersTable).where(eq(customersTable.email, email));
}