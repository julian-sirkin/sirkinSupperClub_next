import { Suspense } from "react";
// import { AboutModule } from "./components/Modules/AboutModule/AboutModule";
import { EventsModule } from "./components/Modules/EventsModule/EventsModule";
import { HeroModule } from "./components/Modules/HeroModule/HeroModule";
// import { PhotosModule } from "./components/Modules/PhotosModule/PhotosModule";
import { MainLayout } from "./components/mainLayout/MainLayout";
import { SuspenseFallback } from "./components/SuspenseFallback/SuspenseFallback";
import dynamic from "next/dynamic";

const AboutModule = dynamic(
  () => import("./components/Modules/AboutModule/AboutModule"),
  {
    loading: () => <SuspenseFallback />,
  }
);
const PhotosModule = dynamic(
  () => import("./components/Modules/PhotosModule/PhotosModule"),
  {
    loading: () => <SuspenseFallback />,
    ssr: false,
  }
);
const ContactModule = dynamic(
  () => import("./components/Modules/ContactModule/ContactModule"),
  {
    loading: () => <SuspenseFallback />,
  }
);

export default function Home() {
  return (
    <main className="">
      <MainLayout>
        <HeroModule />
        <EventsModule />
        <AboutModule />
        <PhotosModule />
        <ContactModule />
      </MainLayout>
    </main>
  );
}
