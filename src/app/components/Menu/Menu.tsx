import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";
import { MENU_RICH_TEXT_OPTIONS } from "./MenuRichTextOptions";

export const Menu = ({ menu, price }: { menu: Document; price: number }) => {
  return (
    <section
      id="menu"
      className="text-gold h-auto w-auto md:w-3/4 mx-auto my-16 px-2 md:px-6 py-6  md:border-8 border-4 border-white opacity-95"
    >
      <h2 className="text-2xl text-gold text-center mb-4">Menu</h2>
      {documentToReactComponents(menu, MENU_RICH_TEXT_OPTIONS)}
      <p className="mt-6 text-right">${price} per person</p>
    </section>
  );
};