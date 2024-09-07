import Image from "next/image";
import "./HeroModule.css";
import Link from "next/link";

export const HeroModule = () => {
  return (
    <div
      className="h-auto w-auto py-10 md:py-12 backgroundImage flex justify-center"
      id="home"
    >
      <div className=" h-[750px] lg:h-[650px] w-[400px] md:w-[500px] lg:w-[650px] mt-20 md:mt-32 md:mb-32 bg-black bg-opacity-90 flex flex-col items-center space-y-12 p-6">
        <Image
          src="/logo/main_logo.png"
          alt="Sirkin Supper Club Logo"
          width={400}
          height={128}
          className="-my-16 hover:cursor-pointer"
        />
        <h2 className="text-white w-64 lg:w-[600px] text-2xl lg:text-3xl text-center -my-8 md:-my-12 md:w-3/4  font-bold">
          The Las Vegas based pop-up restaurant of chef Julian Sirkin now
          serving small-scale speakeasy-style private dinners in an intimate
          setting with a focus on creative food and guest first hospitaltiy.
        </h2>
      </div>
    </div>
  );
};
