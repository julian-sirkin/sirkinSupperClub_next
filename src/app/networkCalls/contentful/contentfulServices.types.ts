import type { Document } from "@contentful/rich-text-types";


export type PictureItem = {
    title: string;
    description: string;
    url: string;
}

export type ParsedTicket = {
    contentfulTicketId: string
    time: Date
    ticketsAvailable: number
    title: string 
    price: number
    isAddonTicket: boolean
    addons: ParsedAddon[]
}

export type ParsedAddon = {
    contentfulAddonId: string
    title: string
    price: number
}

export type UnparsedTickets = {
    items: {
        _id: string
        ticketTime: string
        ticketsAvailable: string
        title: string
        price?: number
        addonCollection?: {
            items: {
                _id: string
                title?: string
                price?: number
            }[]
        }
    }[]
}

export type PhotoGalleryResponse = {
    photoGallery2: {
        title: string;
        picturesCollection: {
            items: PictureItem[];
        };
    };
};

export type ParsedEvent = {
    contentfulEventId: string
    title: string
    date: Date
    price: number
    menu: Document
    shortDescription: string
    longDescription: Document
    tickets: ParsedTicket[]
}

export type ContentfulEventResponse= {
    items: {
    _id: string
    title: string
    shortDescription: string
    price: number
    date: string     
    ticketsCollection: UnparsedTickets
    menu: {
        json: Document
    }
    longDescription: {
        json: Document
    }
    }[]
}