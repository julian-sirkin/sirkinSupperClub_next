import { PhotoGalleryResponse, PictureItem } from "../contentfulServices.types"

export const parsePhotoGallery = (response: PhotoGalleryResponse): PictureItem[] | [] => {
    if ( response?.photoGallery2.picturesCollection) {
       return response?.photoGallery2?.picturesCollection?.items
    }
    else {
        return []
    }
}