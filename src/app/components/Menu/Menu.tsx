import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";
import { MENU_RICH_TEXT_OPTIONS } from "./MenuRichTextOptions";
import { motion } from "framer-motion";

export const Menu = ({ menu, price }: { menu: Document; price: number }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      id="menu"
      className="text-gold h-auto w-11/12 md:w-[800px] mx-auto my-16 px-4 md:px-8 py-8 md:py-12 border-4 md:border-8 border-white bg-black opacity-95 shadow-2xl"
    >
      <h2 className="text-3xl md:text-4xl text-gold text-center mb-8 font-bold border-b-2 border-gold pb-4 w-3/4 md:w-1/2 mx-auto">Menu</h2>
      <div className="menu-content max-w-2xl mx-auto">
        {documentToReactComponents(menu, MENU_RICH_TEXT_OPTIONS)}
      </div>
      <div className="mt-12 border-t-2 border-gold pt-6 max-w-2xl mx-auto">
        <p className="text-right text-xl md:text-2xl font-bold">${price} per person</p>
        <motion.p 
          whileHover={{ scale: 1.05 }}
          className="mt-4 text-right"
        >
          <a
            href="#tickets"
            className="inline-block bg-gold text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors"
          >
            View Tickets
          </a>
        </motion.p>
      </div>
    </motion.section>
  );
};
