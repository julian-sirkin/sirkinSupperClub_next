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

    const uniqueEventIds = [...new Set(ticketsInRequest.map(ticket => ticket.eventContentfulId).filter(Boolean))]
    if (uniqueEventIds.length > 1) {
        return NextResponse.json({
            status: 500,
            error: {
                message: "Cannot complete order",
                data: "Tickets must belong to one event.",
            },
        })
    }

    if (uniqueEventIds.length === 1) {
        const [eventId] = uniqueEventIds
        const events = await contentfulService().getEventsWithoutDB()
        const event = events.find(eventItem => eventItem.contentfulEventId === eventId)

        if (event) {
            const presaleValidation = validatePresaleAccess({
                config: {
                    presaleEnabled: event.presaleEnabled,
                    presaleEndsAt: event.presaleEndsAt,
                    presalePassword: event.presalePassword,
                },
                providedPassword: presalePassword,
            })

            if (!presaleValidation.isValid) {
                return NextResponse.json({
                    status: 500,
                    error: {
                        message: "Presale password validation failed",
                        data: presaleValidation.errorMessage,
                    },
                })
            }
        }
    }

    /**
     * Verify Requested tickets are available in database
     */
    const ticketsInDatabase = await getTicketsByIdAndEvent(ticketsInRequest)

    const {areQuantitiesAvailable, ticketsWithNotEnoughAvailable} = validateTicketQuantityForPurchase({ticketsInRequest, ticketsInDatabase})

    if(!areQuantitiesAvailable) {
        return NextResponse.json({status: 500, error: {
            message: "Cannot complete order",
            data: ticketsWithNotEnoughAvailable
        }})
    }

    const addonLinks = await getAllowedAddonsForTicketSelections(ticketsInRequest);
    const { areAddonSelectionsValid, addonSelectionErrors } = validateAddonSelectionsForPurchase({
        ticketsInRequest,
        addonLinks,
    });

    if (!areAddonSelectionsValid) {
        return NextResponse.json({
            status: 500,
            error: {
                message: "Invalid addon selection",
                data: addonSelectionErrors,
            },
        });
    }

    /**
     * Verify Customer exists, if not add them to database
     */
    const customerInDatabase = await getCustomerByEmail(email)

    let customerId: number;
    if (customerInDatabase[0]?.id) {
        customerId = customerInDatabase[0].id;
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
        } catch (error) {
            return NextResponse.json({
                status: 500,
                message: `Failed to create customer: ${error instanceof Error ? error.message : 'Database error'}`,
                error: 'CUSTOMER_CREATION_FAILED'
            });
        }
    }

    /**
     * Complete purchase
     */
    const {isSuccessful, message} = await createTicketPurchase(ticketsInRequest, customerId, false)

    if(isSuccessful) {
        const {emailSuccessfully} = await successEmail({
            customer: {name: customerName, email, phoneNumber, notes, dietaryRestrictions},
            tickets: ticketsInRequest,
            clientTimeZone,
        })
        
        return emailSuccessfully ? NextResponse.json({status: 200, message: successfulRegisteredMessage}) : NextResponse.json({status: 500, message: emailFailMessage})

    } else {
        return NextResponse.json({status: 500, message})
    }
}