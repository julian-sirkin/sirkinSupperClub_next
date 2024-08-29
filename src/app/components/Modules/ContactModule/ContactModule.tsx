import { ContactForm } from "../../ContactForm/ContactForm";

const ContactModule = () => {
  return (
    <section id="contact" className="bg-gold h-auto p-8">
      <h2 className="text-xl md:text-5xl text-white text-center">Contact</h2>
      <ContactForm />
    </section>
  );
};

export default ContactModule;
