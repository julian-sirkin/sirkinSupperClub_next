import { EventsModule } from "./components/Modules/EventsModule/EventsModule";
import { HeroModule } from "./components/Modules/HeroModule/HeroModule";
import dynamic from "next/dynamic";
import { MainLayout } from "./components/mainLayout/MainLayout";
import { SuspenseFallback } from "./components/SuspenseFallback/SuspenseFallback";
import { Suspense } from "react";

const AboutModule = dynamic(
  () => import("./components/Modules/AboutModule/AboutModule")
);
const PhotosModule = dynamic(
  () => import("./components/Modules/PhotosModule/PhotosModule")
);
const ContactModule = dynamic(
  () => import("./components/Modules/ContactModule/ContactModule")
);

export default function Home() {
  return (
    <main className="">
      <MainLayout>
        <HeroModule />
        <EventsModule />
        <Suspense fallback={<SuspenseFallback />}>
          <AboutModule />
          <PhotosModule />
          <ContactModule />
        </Suspense>
      </MainLayout>
    </main>
  );
}
