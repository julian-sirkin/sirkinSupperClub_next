import Link from "next/link";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";

export const MENU_RICH_TEXT_OPTIONS = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return (
        <p className="p-2 md:p-4 text-lg md:text-2xl text-center md:text-left mb-6">
          {children}
        </p>
      );
    },
    [BLOCKS.HEADING_3]: (node: any, children: any) => {
      return (
        <h3 className="text-xl md:text-2xl text-white font-bold mb-4 mt-8 border-l-4 border-gold pl-4">
          {children}
        </h3>
      );
    },
    [BLOCKS.UL_LIST]: (node: any, children: any) => {
      return (
        <ul className="list-disc pl-8 mb-6 text-lg md:text-xl space-y-2">
          {children}
        </ul>
      );
    },
    [BLOCKS.OL_LIST]: (node: any, children: any) => {
      return (
        <ol className="list-decimal pl-8 mb-6 text-lg md:text-xl space-y-2">
          {children}
        </ol>
      );
    },
    [BLOCKS.LIST_ITEM]: (node: any, children: any) => {
      return <li className="text-white">{children}</li>;
    },
    [INLINES.HYPERLINK]: (node: any, children: any) => {
      return (
        <Link 
          href={node.data.uri}
          className="text-gold underline hover:text-white transition-colors"
        >
          {children}
        </Link>
      );
    },
  },
  renderMark: {
    [MARKS.BOLD]: (text: any) => {
      return <span className="text-white font-bold">{text}</span>;
    },
    [MARKS.ITALIC]: (text: any) => {
      return <span className="italic text-gold">{text}</span>;
    },
  },
};
