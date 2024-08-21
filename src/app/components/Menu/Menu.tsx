import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";
import { MENU_RICH_TEXT_OPTIONS } from "./MenuRichTextOptions";

export const Menu = ({ menu }: { menu: Document }) => {
  return (
    <section
      id="menu"
      className="text-gold h-auto w-3/4 mx-auto my-16 p-4 border-4 border-gold opacity-95"
    >
      <h2 className="text-2xl text-gold text-center">Menu</h2>
      {documentToReactComponents(menu, MENU_RICH_TEXT_OPTIONS)}
    </section>
  );
};
