import Image from "next/image";
import { MainLayout } from "./components/mainLayout/MainLayout";

export default function Home() {
  return (
    <main className="">
      <MainLayout>
        <div>inside main layout</div>
      </MainLayout>
    </main>
  );
}
