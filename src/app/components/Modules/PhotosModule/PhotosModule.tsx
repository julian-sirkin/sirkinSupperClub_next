import { contentfulService } from "@/app/contentful/contentfulService";
import Image from "next/image";

const PhotosModule = async () => {
  const { getPhotoGallery } = contentfulService();
  const pictureGallery = await getPhotoGallery();

  console.log(pictureGallery[0].url, "pictureGallery");
  return (
    <div className="h-96 bg-black text-white">
      <h3>Photo Section</h3>
      {pictureGallery
        ? pictureGallery.map((picture) => (
            <div key={picture.title}>
              <h1>{picture.title}</h1>
              {/* <img src={picture.url} alt={picture.title} /> */}
              <Image
                src={picture.url}
                alt={picture.title}
                height={250}
                width={250}
              />
            </div>
          ))
        : null}
    </div>
  );
};

export default PhotosModule;
