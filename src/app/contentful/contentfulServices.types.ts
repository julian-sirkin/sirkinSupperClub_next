import type { Document } from "@contentful/rich-text-types";


export type PictureItem = {
    title: string;
    description: string;
    url: string;
}

export type ParsedTicket = {
    time: Date
    ticketsAvailable: number
    title: string 
}

export type UnparsedTickets = {
    items: {
        ticketTime: string
        ticketsAvailable: string
        title: string
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