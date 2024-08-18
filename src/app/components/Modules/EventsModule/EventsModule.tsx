import { PasswordForm } from "../../PasswordForm/PasswordForm";

export const EventsModule = () => {
  return (
    <div className="h-auto bg-gold text-black p-4">
      <h2 className="text-3xl pb-10 md:pb-4 text-center font-bold">
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
