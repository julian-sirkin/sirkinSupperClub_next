export const  photoAlbumQuery = `query fetch{
photoGallery2(id:"7wZtQjHNkqA6BI4jg0FVZa"){
    title
    picturesCollection(limit:20){
      items{
        title
	description
        url(transform: {height: 250 width: 250})
      }
    }
  }
}`