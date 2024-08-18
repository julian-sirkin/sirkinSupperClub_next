import { PhotoGalleryResponse } from "./contentfulServices.types"
import { photoAlbumQuery } from "./graphQL/queries/photoAlbum"
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

    return {getPhotoGallery}
}