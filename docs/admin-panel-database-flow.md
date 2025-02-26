# Admin Panel Database Flow

This document explains how data flows through the admin panel, including database queries and component interactions.

## Overview

The admin panel consists of two main sections:
1. **Events Section**: Displays all events and their tickets, with customer purchase details
2. **Customers Section**: Shows all customers and their purchase history

## Database Schema

The database uses the following tables:
- `events`: Stores event information (id, title, date, contentfulId)
- `tickets`: Stores ticket information (id, event, time, totalAvailable, totalSold)
- `customers`: Stores customer information (id, name, email, phoneNumber, notes)
- `purchases`: Stores purchase records (id, customerId, ticketId, quantity, purchaseDate)

## Data Flow for Events Section

1. **Initial Load**:
   - `getAllAdminEvents()` queries the database to get all events with aggregated ticket counts
   - The query joins the `events` and `tickets` tables, grouping by event ID
   - Results are displayed in the events table

2. **Event Details**:
   - When a user clicks on an event, `getEventTicketsWithPurchases(eventId)` is called
   - This query:
     - Gets the event details from the `events` table
     - Gets all tickets for the event from the `tickets` table
     - For each ticket, gets all purchases from the `purchases` table
     - Joins with the `customers` table to get customer information
   - Results are displayed in the event details view

3. **Refund Process**:
   - When a refund is processed, a POST request is sent to `/api/refundTickets`
   - The API uses a database transaction to:
     - Update or delete the purchase record in the `purchases` table
     - Update the `totalSold` count in the `tickets` table
   - After the refund, the event details are refreshed

## Data Flow for Customers Section

1. **Initial Load**:
   - `getAllCustomers()` queries the database to get all customers with their purchase counts
   - The query joins the `customers` and `purchases` tables, grouping by customer ID
   - Results are displayed in the customers table

2. **Customer Details**:
   - When a user clicks on a customer, `getCustomerDetails(customerId)` is called
   - This query:
     - Gets the customer details from the `customers` table
     - Gets all purchases from the `purchases` table
     - Joins with the `tickets` and `events` tables to get event information
   - Results are displayed in the customer details view

## URL Parameters

The admin panel supports URL parameters for direct navigation:
- `?view=customer`: Shows the customers section
- `?view=customer&id=123`: Shows details for customer with ID 123

## Component Hierarchy 

## Database Schema Details

### Purchases Table
The `purchases` table stores information about ticket purchases:

- `id`: Primary key
- `customerId`: Foreign key referencing the `customers` table
- `ticketId`: Foreign key referencing the `tickets` table
- `quantity`: Number of tickets purchased
- `purchaseDate`: Timestamp of when the purchase was made

The key relationships are:
- Each purchase is associated with one customer
- Each purchase is for a specific ticket
- Multiple purchases can be made for the same ticket by different customers 