# Database Flow and Connections Guide

This document explains how the database tables connect and how data flows through the system. Use this as a reference when working with the database schema.

## Table Relationships Overview

```
┌─────────────┐
│   Events    │
│  (Master)  │
└──────┬──────┘
       │
       │ 1:N (one event has many tickets)
       │
       ▼
┌─────────────┐
│   Tickets   │
│  (Time Slots)│
└──────┬──────┘
       │
       │ 1:N (one ticket can have many purchase items)
       │
       ▼
┌─────────────────┐
│ Purchase Items  │
│  (Quantities)    │
└──────┬──────────┘
       │
       │ N:1 (many purchase items belong to one purchase)
       │
       ▼
┌─────────────┐
│  Purchases  │
│  (Orders)   │
└──────┬──────┘
       │
       │ N:1 (many purchases belong to one customer)
       │
       ▼
┌─────────────┐
│  Customers  │
│  (People)   │
└─────────────┘
```

## Core Concepts

### 1. Events (The Master Record)
**Table**: `events`
- **Purpose**: Represents a dinner event (e.g., "Ducking Good Dinner", "Pizza Night")
- **Key Fields**:
  - `id`: Primary key
  - `title`: Event name
  - `date`: Event date (timestamp)
  - `contentfulId`: Reference to Contentful CMS entry

**Think of it as**: The main event that happens on a specific date.

### 2. Tickets (Time Slots for an Event)
**Table**: `tickets`
- **Purpose**: Represents a specific time slot for purchasing tickets to an event
- **Key Fields**:
  - `id`: Primary key
  - `event`: Foreign key → `events.id` (which event this ticket is for)
  - `time`: The time slot (e.g., 6:45 PM, 8:00 PM)
  - `totalAvailable`: How many tickets can be sold for this time slot
  - `totalSold`: How many tickets have been sold (must match sum of purchase_items.quantity)
  - `contentfulId`: Reference to Contentful ticket entry

**Think of it as**: A specific seating time for an event. One event can have multiple tickets (different times).

**Example**:
- Event: "Ducking Good Dinner" (Dec 13, 2025)
  - Ticket 1: 6:45 PM (6 available)
  - Ticket 2: 8:00 PM (6 available)
  - Ticket 3: 8:45 PM (6 available)

### 3. Customers (People Who Buy Tickets)
**Table**: `customers`
- **Purpose**: Stores customer information
- **Key Fields**:
  - `id`: Primary key
  - `name`: Customer name
  - `email`: Customer email (unique identifier)
  - `phoneNumber`: Optional
  - `priorCustomer`: Boolean flag
  - `notes`: Optional notes

**Think of it as**: A person who can make purchases.

### 4. Purchases (Orders/Transactions)
**Table**: `purchases`
- **Purpose**: Represents a single purchase transaction by a customer
- **Key Fields**:
  - `id`: Primary key
  - `customerId`: Foreign key → `customers.id` (who made this purchase)
  - `paid`: Boolean (has payment been received?)
  - `purchaseDate`: When the purchase was made
  - `updatedDate`: Last update timestamp
  - `refundDate`: If refunded, when it happened

**Think of it as**: An order/transaction. One customer can have multiple purchases over time.

**Important**: A purchase can contain multiple items (via `purchase_items`), but all items in a purchase are for the same customer.

### 5. Purchase Items (What Was Bought)
**Table**: `purchase_items`
- **Purpose**: Links a purchase to specific tickets with quantities
- **Key Fields**:
  - `id`: Primary key
  - `purchaseId`: Foreign key → `purchases.id` (which purchase this item belongs to)
  - `ticketId`: Foreign key → `tickets.id` (which ticket was purchased)
  - `quantity`: How many tickets of this type were purchased
  - `createdAt`: When item was added
  - `updatedAt`: Last update timestamp

**Think of it as**: A line item in an order. One purchase can have multiple purchase items (e.g., 2 tickets at 6:45 PM + 4 tickets at 8:00 PM).

**Critical Constraint**: 
- `tickets.totalSold` must equal the sum of all `purchase_items.quantity` for that ticket
- When creating/updating purchase items, you must update `tickets.totalSold` accordingly

## Data Flow Examples

### Example 1: Customer Buys 6 Tickets at 6:45 PM

1. **Customer exists or is created**:
   ```
   customers table:
   id: 6, name: "Barry Stieb", email: "barry@example.com"
   ```

2. **Event and Ticket exist**:
   ```
   events table:
   id: 11, title: "Ducking Good Dinner", date: Dec 13, 2025
   
   tickets table:
   id: 52, event: 11, time: 6:45 PM, totalAvailable: 6, totalSold: 0
   ```

3. **Purchase is created**:
   ```
   purchases table:
   id: 99, customerId: 6, paid: false, purchaseDate: Nov 16, 2025
   ```

4. **Purchase Item links purchase to ticket**:
   ```
   purchase_items table:
   id: 94, purchaseId: 99, ticketId: 52, quantity: 6
   ```

5. **Ticket totalSold is updated**:
   ```
   tickets table (updated):
   id: 52, totalSold: 6 (was 0, now 6)
   ```

### Example 2: Customer Buys Multiple Time Slots

A customer can buy tickets for different time slots in one purchase:

```
purchases table:
id: 100, customerId: 7

purchase_items table:
id: 95, purchaseId: 100, ticketId: 52 (6:45 PM), quantity: 2
id: 96, purchaseId: 100, ticketId: 54 (8:00 PM), quantity: 4
```

This represents one purchase with 2 tickets at 6:45 PM and 4 tickets at 8:00 PM.

## Foreign Key Relationships

### events → tickets
- `tickets.event` → `events.id`
- **Relationship**: One event has many tickets
- **Cascade**: If event is deleted, tickets should be handled (usually set to null or deleted)

### tickets → purchase_items
- `purchase_items.ticketId` → `tickets.id`
- **Relationship**: One ticket can have many purchase items
- **Cascade**: If ticket is deleted, purchase items should be deleted first (foreign key constraint)

### purchases → purchase_items
- `purchase_items.purchaseId` → `purchases.id`
- **Relationship**: One purchase can have many purchase items
- **Cascade**: If purchase is deleted, purchase items should be deleted first

### customers → purchases
- `purchases.customerId` → `customers.id`
- **Relationship**: One customer can have many purchases
- **Cascade**: If customer is deleted, purchases should be handled (usually kept for historical record)

## Common Operations and Their Flows

### Creating a New Purchase

1. **Find or create customer** (by email)
2. **Create purchase record** (link to customer)
3. **For each ticket being purchased**:
   - Create `purchase_item` (link purchase to ticket with quantity)
   - Update `ticket.totalSold` (increment by quantity)
4. **Transaction**: All steps should be in a database transaction

### Refunding Tickets

1. **Find purchase and purchase items**
2. **For each purchase item being refunded**:
   - Update `ticket.totalSold` (decrement by quantity)
   - Optionally delete or mark purchase item
3. **Update purchase** (set `refundDate`, mark as refunded)
4. **Transaction**: All steps should be in a database transaction

### Syncing Events from Contentful

1. **Fetch events from Contentful** (via GraphQL API)
2. **For each event**:
   - Find or create event in database (match by `contentfulId`)
   - For each ticket in Contentful event:
     - Find or create ticket (match by `contentfulId`)
     - Update ticket's `event` foreign key (in case it changed)
     - Update `totalAvailable` from Contentful
3. **Note**: `totalSold` is NOT synced from Contentful - it's calculated from `purchase_items`

### Querying Event with All Purchases

To get an event with all its tickets and purchases:

1. **Get event** (by ID)
2. **Get all tickets** for that event (`tickets.event = eventId`)
3. **For each ticket**:
   - Get all `purchase_items` for that ticket
   - For each purchase item:
     - Get the `purchase` record
     - Get the `customer` record
     - Combine into purchase object with customer info
4. **Return**: Event with tickets, each ticket with its purchases

## Important Constraints and Rules

### 1. Ticket Counts Must Match
- `tickets.totalSold` must equal: `SUM(purchase_items.quantity WHERE purchase_items.ticketId = ticket.id)`
- Always update `totalSold` when creating/deleting purchase items
- Never update `totalSold` directly without updating purchase items

### 2. Purchase Items Cascade
- Cannot delete a ticket if it has purchase items (foreign key constraint)
- Must delete purchase items first, then ticket
- Or: Set ticket's `event` to null (orphan the ticket) instead of deleting

### 3. Customer Uniqueness
- Customers are identified by `email` (should be unique, but not enforced at DB level)
- Always check for existing customer by email before creating new one

### 4. Contentful Sync
- Events and tickets have `contentfulId` to match with Contentful CMS
- When syncing, match by `contentfulId`, not by title or date
- `totalAvailable` comes from Contentful
- `totalSold` is calculated from database purchase items

## Common Query Patterns

### Get all tickets for an event
```typescript
SELECT * FROM tickets WHERE event = eventId
```

### Get all purchases for a ticket
```typescript
SELECT pi.*, p.*, c.*
FROM purchase_items pi
JOIN purchases p ON pi.purchase_id = p.id
JOIN customers c ON p.customer_id = c.id
WHERE pi.ticket_id = ticketId
```

### Get all purchases for a customer
```typescript
SELECT p.*, pi.*, t.*, e.*
FROM purchases p
JOIN purchase_items pi ON p.id = pi.purchase_id
JOIN tickets t ON pi.ticket_id = t.id
JOIN events e ON t.event = e.id
WHERE p.customer_id = customerId
```

### Calculate totalSold for a ticket
```typescript
SELECT COALESCE(SUM(quantity), 0) as totalSold
FROM purchase_items
WHERE ticket_id = ticketId
```

## Troubleshooting Common Issues

### Issue: Ticket totalSold doesn't match purchase items
**Solution**: Recalculate from purchase items:
```typescript
const totalSold = await db
  .select({ sum: sql`COALESCE(SUM(${purchaseItemsTable.quantity}), 0)` })
  .from(purchaseItemsTable)
  .where(eq(purchaseItemsTable.ticketId, ticketId));

await db
  .update(ticketsTable)
  .set({ totalSold: totalSold[0].sum })
  .where(eq(ticketsTable.id, ticketId));
```

### Issue: Orphaned purchase items (ticket deleted but items remain)
**Solution**: Check for orphaned items:
```typescript
SELECT pi.* FROM purchase_items pi
LEFT JOIN tickets t ON pi.ticket_id = t.id
WHERE t.id IS NULL
```

### Issue: Tickets linked to wrong event
**Solution**: Update ticket's event foreign key:
```typescript
UPDATE tickets SET event = correctEventId WHERE id = ticketId
```

## Key Takeaways

1. **Events** are the top-level entity - everything flows from events
2. **Tickets** are time slots for events - one event, many tickets
3. **Customers** make **Purchases** which contain **Purchase Items** that reference **Tickets**
4. **Always maintain**: `tickets.totalSold` = sum of `purchase_items.quantity` for that ticket
5. **Use transactions** when creating purchases or refunds (multiple table updates)
6. **Match by contentfulId** when syncing from Contentful, not by title/date
7. **Foreign keys enforce relationships** - delete in correct order (items → purchases/tickets → events/customers)

