import { validateTicketQuantityForPurchase } from "@/app/helpers/validateTicketQuantityForPurchase"
import { validateAddonSelectionsForPurchase } from "@/app/helpers/validateAddonSelectionsForPurchase"
import { validatePresaleAccess } from "@/app/helpers/validatePresaleAccess"
import { contentfulService } from "@/app/networkCalls/contentful/contentfulService"
import { CartTicketType } from "@/store/cartStore.types"
import { NextResponse } from "next/server"
import { createCustomer, createTicketPurchase } from "../queries/insert"
import { getAllowedAddonsForTicketSelections, getCustomerByEmail, getTicketsByIdAndEvent } from "../queries/select"
import { successEmail } from "./successEmail"
import { emailFailMessage, successfulRegisteredMessage } from "@/app/constants"

export async function POST(request: Request) {
    const traceId = `claimTickets-${Date.now()}`
    const log = (message: string, payload?: unknown) => {
        if (payload !== undefined) {
            console.log(`[${traceId}] ${message}`, payload)
            return
        }
        console.log(`[${traceId}] ${message}`)
    }

    /**
     * Pull off Data from request
     */
    const data = await request.json()
    const ticketsInRequest: CartTicketType[] = data?.purchasedTickets ?? []
    const email: string = data?.email ?? ''
    const customerName: string = data?.name ?? ''
    const phoneNumber: string = data?.phoneNumber ?? ''
    const notes: string = data?.notes ?? ''
    const dietaryRestrictions: string = data?.dietaryRestrictions
    const clientTimeZone: string | undefined = data?.clientTimeZone
    const presalePassword: string = data?.presalePassword ?? ''
    log("Request received", {
        ticketCount: ticketsInRequest.length,
        eventIds: [...new Set(ticketsInRequest.map(ticket => ticket.eventContentfulId).filter(Boolean))],
        hasPresalePassword: Boolean(presalePassword?.trim()),
    })

    const uniqueEventIds = [...new Set(ticketsInRequest.map(ticket => ticket.eventContentfulId).filter(Boolean))]
    if (uniqueEventIds.length > 1) {
        log("Rejected: mixed event IDs in one checkout", uniqueEventIds)
        return NextResponse.json({
            status: 500,
            error: {
                message: "Cannot complete order",
                data: "Tickets must belong to one event.",
            },
            traceId,
        }, { status: 500 })
    }

    if (uniqueEventIds.length === 1) {
        const [eventId] = uniqueEventIds
        log("Loading Contentful event for presale validation", { eventId })
        const events = await contentfulService().getEventsWithoutDB()
        const event = events.find(eventItem => eventItem.contentfulEventId === eventId)

        if (event) {
            log("Presale configuration found", {
                eventId: event.contentfulEventId,
                presaleEnabled: event.presaleEnabled,
                hasConfiguredPassword: Boolean(event.presalePassword?.trim()),
                presaleEndsAt: event.presaleEndsAt ? event.presaleEndsAt.toISOString() : null,
            })
            const presaleValidation = validatePresaleAccess({
                config: {
                    presaleEnabled: event.presaleEnabled,
                    presaleEndsAt: event.presaleEndsAt,
                    presalePassword: event.presalePassword,
                },
                providedPassword: presalePassword,
            })

            if (!presaleValidation.isValid) {
                log("Rejected: presale password validation failed", {
                    eventId,
                    reason: presaleValidation.errorMessage,
                })
                return NextResponse.json({
                    status: 500,
                    error: {
                        message: "Presale password validation failed",
                        data: presaleValidation.errorMessage,
                    },
                    traceId,
                }, { status: 500 })
            }

            log("Presale validation passed", { eventId })
        } else {
            log("Warning: event not found in Contentful during presale validation", { eventId })
        }
    }

    /**
     * Verify Requested tickets are available in database
     */
    log("Validating ticket quantities against database")
    const ticketsInDatabase = await getTicketsByIdAndEvent(ticketsInRequest)

    const {areQuantitiesAvailable, ticketsWithNotEnoughAvailable} = validateTicketQuantityForPurchase({ticketsInRequest, ticketsInDatabase})

    if(!areQuantitiesAvailable) {
        log("Rejected: insufficient ticket inventory", ticketsWithNotEnoughAvailable)
        return NextResponse.json({status: 500, error: {
            message: "Cannot complete order",
            data: ticketsWithNotEnoughAvailable
        }, traceId}, { status: 500 })
    }

    log("Validating addon selections")
    const addonLinks = await getAllowedAddonsForTicketSelections(ticketsInRequest);
    const { areAddonSelectionsValid, addonSelectionErrors } = validateAddonSelectionsForPurchase({
        ticketsInRequest,
        addonLinks,
    });

    if (!areAddonSelectionsValid) {
        log("Rejected: invalid addon selections", addonSelectionErrors)
        return NextResponse.json({
            status: 500,
            error: {
                message: "Invalid addon selection",
                data: addonSelectionErrors,
            },
            traceId,
        }, { status: 500 });
    }

    /**
     * Verify Customer exists, if not add them to database
     */
    log("Resolving customer by email", { email })
    const customerInDatabase = await getCustomerByEmail(email)

    let customerId: number;
    if (customerInDatabase[0]?.id) {
        customerId = customerInDatabase[0].id;
        log("Existing customer found", { customerId })
    } else {
        const customerData = {
            email,
            name: customerName,
            priorCustomer: false,
            phoneNumber: phoneNumber || null,
            notes: notes || null,
            dietaryRestrictions: dietaryRestrictions || null
        };
        
        try {
            const newCustomer = await createCustomer(customerData);
            customerId = newCustomer[0].id;
            log("Created new customer", { customerId })
        } catch (error) {
            log("Rejected: customer creation failed", { error: error instanceof Error ? error.message : "Database error" })
            return NextResponse.json({
                status: 500,
                message: `Failed to create customer: ${error instanceof Error ? error.message : 'Database error'}`,
                error: 'CUSTOMER_CREATION_FAILED',
                traceId,
            }, { status: 500 });
        }
    }

    /**
     * Complete purchase
     */
    log("Creating purchase transaction", { customerId })
    const {isSuccessful, message} = await createTicketPurchase(ticketsInRequest, customerId, false)

    if(isSuccessful) {
        log("Purchase created successfully, sending email")
        const {emailSuccessfully} = await successEmail({
            customer: {name: customerName, email, phoneNumber, notes, dietaryRestrictions},
            tickets: ticketsInRequest,
            clientTimeZone,
        })
        
        if (emailSuccessfully) {
            log("Checkout complete")
            return NextResponse.json({status: 200, message: successfulRegisteredMessage, traceId}, { status: 200 })
        }

        log("Checkout created but confirmation email failed")
        return NextResponse.json({status: 500, message: emailFailMessage, traceId}, { status: 500 })

    } else {
        log("Rejected: purchase creation failed", { message })
        return NextResponse.json({status: 500, message, traceId}, { status: 500 })
    }
}