import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const customersTable = sqliteTable('customers', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phoneNumber: text('phoneNumber'),
    priorCustomer: integer('priorCustomer', {mode: 'boolean'}).notNull(),
    notes: text('notes')
})

export const ticketsTable = sqliteTable('tickets', {
    id: integer('id').primaryKey(),
    contentfulId: text('contentfulId').notNull(),
    event: integer('event_id').references(() => eventsTable.id),
    totalAvailable: integer('totalAvailable').notNull(),
    totalSold: integer('totalSold').notNull(),
    time: integer('time', {mode: 'timestamp'})
})

export const eventsTable = sqliteTable('events', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    date: integer('time', {mode: 'timestamp'}),
    contentfulId: text('contentfulId').notNull(),
})

export const purchasesTable = sqliteTable('purchases', {
    id: integer('id').primaryKey(),
    customerId: integer('customer_id').references(() => customersTable.id).notNull(),
    paid: integer('paid', { mode: 'boolean' }).notNull(),
    purchaseDate: integer('purchase_date', { mode: 'timestamp' }).notNull(),  // Track when the purchase was made
    updatedDate: integer('updated_date', { mode: 'timestamp' }).notNull(),  // Track any updates (e.g., refunds)
    refundDate: integer('refund_date', { mode: 'timestamp' })  // Track if/when a refund occurs
});

export const purchaseItemsTable = sqliteTable('purchase_items', {
    id: integer('id').primaryKey(),
    purchaseId: integer('purchase_id').references(() => purchasesTable.id).notNull(),
    ticketId: integer('ticket_id').references(() => ticketsTable.id).notNull(),
    quantity: integer('quantity').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),  // When the item was added to the purchase
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()  // Track updates (e.g., item returns/refunds)
});

export type InsertCustomer = typeof customersTable.$inferInsert;
export type SelectCustomer = typeof customersTable.$inferSelect; 

export type InsertTicket = typeof ticketsTable.$inferInsert
export type SelectTicket = typeof ticketsTable.$inferSelect; 

export type InsertEvent = typeof eventsTable.$inferInsert
export type SelectEvent = typeof eventsTable.$inferSelect; 

export type InsertPurchase = typeof purchasesTable.$inferInsert
export type SelectPurchase = typeof purchasesTable.$inferSelect; 

export type InsertPurchaseItem = typeof purchaseItemsTable.$inferInsert
export type SelectPurchaseItem = typeof purchaseItemsTable.$inferSelect; 
