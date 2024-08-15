import { HeroModule } from "./components/Modules/HeroModule/HeroModule";
import { MainLayout } from "./components/mainLayout/MainLayout";

export default function Home() {
  return (
    <main className="">
      <MainLayout>
        <HeroModule />
      </MainLayout>
    </main>
  );
}
