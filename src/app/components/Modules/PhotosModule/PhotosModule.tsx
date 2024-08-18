import { contentfulService } from "@/app/contentful/contentfulService";
import { PictureCard } from "../../PictureCard/PictureCard";

const PhotosModule = async () => {
  const { getPhotoGallery } = contentfulService();
  const pictureGallery = await getPhotoGallery();

  console.log(pictureGallery.length);
  return (
    <div className="h-auto px-8 bg-black text-white font-bold" id="photos">
      <h3 className="text-center text-4xl py-8">Photos</h3>
      <div className="flex flex-wrap justify-center md:justify-between max-w-5xl mx-auto">
        {pictureGallery
          ? pictureGallery.map(({ title, description, url }) => (
              <PictureCard
                key={title}
                title={title}
                description={description}
                url={url}
              />
            ))
          : null}
      </div>
    </div>
  );
};

export default PhotosModule;
