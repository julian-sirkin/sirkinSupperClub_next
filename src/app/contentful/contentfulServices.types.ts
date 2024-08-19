import {EntryFieldTypes} from 'contentful'


export type PictureItem = {
    title: string;
    description: string;
    url: string;
}

export type Parsedticket = {
    time: Date
    ticketsAvailble: string
    title: string 
}

export type UnparsedTickets = {
    items: {
        ticketTime: string
        ticketsAvailble: string
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

export type ParsedEvents = {
    title: string
    date: Date
    price: number
    menu: EntryFieldTypes.RichText
    shortDescription: string
    longDescription: EntryFieldTypes.RichText
    tickets: Parsedticket[]
}

export type ContentfulEventResponse= {
    items: {
    title: string
    shortDescription: string
    price: number
    date: string     
    ticketsCollection: UnparsedTickets
    menu: {
        json: EntryFieldTypes.RichText
    }
    longDescription: {
        json: EntryFieldTypes.RichText
    }
    }[]
}