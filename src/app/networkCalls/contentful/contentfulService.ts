import { ParsedEvent, PhotoGalleryResponse } from "./contentfulServices.types"
import { eventsQuery } from "./graphQL/queries/events"
import { photoAlbumQuery } from "./graphQL/queries/photoAlbum"
import { parseEvents } from "./parsers/parseEvents"
import { parsePhotoGallery } from "./parsers/parsePhotoGallery"

export const contentfulService = () => {
    const contentfulEndpoint = process.env.CONTENTFUL_GRAPHQL_ENDPOINT

    const getPhotoGallery = async () => {
        const requestBody = JSON.stringify({query: photoAlbumQuery})

        if (contentfulEndpoint) {
            const fetchOptions = {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`
                },
                body: requestBody
            }

            
          const response = await fetch(contentfulEndpoint, fetchOptions)
            const decodedResponse: {data: PhotoGalleryResponse} = await response.json()
            return await parsePhotoGallery(decodedResponse.data)
        }
        else {
            return []
        }
    }

    const getEvents = async (): Promise<ParsedEvent[]> => {
        const requestBody = JSON.stringify({query: eventsQuery})

        if (contentfulEndpoint) {
            const fetchOptions = {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`
                },
                body: requestBody
            }

            
          const response = await fetch(contentfulEndpoint, fetchOptions)
            const decodedResponse: {data: any} = await response.json()           
            if (decodedResponse?.data?.eventTypeCollection) {
                return await parseEvents(decodedResponse.data.eventTypeCollection)    
            }
            else {
                return parseEvents(null)
            }
                    }
        else {
            return []
        }
    }

    return {getPhotoGallery, getEvents}
}