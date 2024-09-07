import { PasswordForm } from "../../PasswordForm/PasswordForm";

export const EventsModule = () => {
  return (
    <div className="h-auto bg-gold text-black px-4 py-8 md:py-12">
      <h2 className="text-3xl mb-10 md:mb-4 text-center font-bold">
        Events Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 w-2/3 mx-auto">
        <PasswordForm />
        <ul className="w-auto text-2xl md:text-3xl list-disc">
          <li>Chef Driven</li>
          <li>BYOB</li>
          <li>Tipping Optional</li>
          <li>Meet Dope People</li>
          <li>Unscheduled Private Events Available</li>
        </ul>
      </div>
      <div></div>
    </div>
  );
};
