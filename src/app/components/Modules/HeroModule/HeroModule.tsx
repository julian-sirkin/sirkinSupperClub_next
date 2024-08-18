import Image from "next/image";
import "./HeroModule.css";

export const HeroModule = () => {
  return (
    <div className="h-lvh w-auto backgroundImage flex justify-center ">
      <div className="w-80 h-2/3 lg:h-1/2 md:w-1/2 lg:w-2/3  mt-20 md:mt-32 bg-black bg-opacity-90 flex flex-col items-center space-y-12 p-6">
        <Image
          src="/logo/main_logo.png"
          alt="Sirkin Supper Club Logo"
          width={400}
          height={128}
          className="-my-16"
        />
        <div>
          <h2 className="text-white w-64 text-2xl text-center -my-8 md:-my-12 md:w-3/4 mx-auto font-bold">
            The Las Vegas based pop-up restaurant of chef Julian Sirkin now
            serving small-scale speakeasy-style private dinners in an intimate
            setting with a focus on creative food and guest first hospitaltiy.
          </h2>
        </div>
      </div>
    </div>
  );
};
