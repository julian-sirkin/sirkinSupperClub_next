import { contentfulService } from "@/app/contentful/contentfulService";
import { PictureCard } from "../../PictureCard/PictureCard";

const PhotosModule = async () => {
  const { getPhotoGallery } = contentfulService();
  const pictureGallery = await getPhotoGallery();

  console.log(pictureGallery.length);
  return (
    <div className="h-auto p-8 bg-black text-white font-bold" id="photos">
      <h3 className="text-center text-4xl mb-8">Photos</h3>
      <div className="flex flex-wrap gap-6 lg:gap-10 mx-auto justify-center lg:max-w-[1370px]">
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
