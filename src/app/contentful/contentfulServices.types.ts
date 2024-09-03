import type { Document } from "@contentful/rich-text-types";


export type PictureItem = {
    title: string;
    description: string;
    url: string;
}

export type ParsedTicket = {
    contentfulId: string
    time: Date
    ticketsAvailable: number
    title: string 
}

export type UnparsedTickets = {
    items: {
        _id: string
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
    contentfulId: string
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