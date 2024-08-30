import { ContactForm } from "../../ContactForm/ContactForm";
import { ContactLinks } from "../../ContactLinks/ContactLinks";

const ContactModule = () => {
  return (
    <section id="contact" className="bg-gold h-auto p-8">
      <h2 className="text-2xl md:text-5xl text-white text-center font-bold mb-4">
        Contact
      </h2>
      <div className="flex flex-col-reverse md:flex-row justify-center gap-4 md:gap-12">
        <ContactForm />
        <ContactLinks />
      </div>
    </section>
  );
};

export default ContactModule;
