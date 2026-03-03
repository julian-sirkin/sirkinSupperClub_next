import Link from "next/link";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";

export const EVENT_RICHTEXT_OPTIONS = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return (
        <p className="mb-5 text-base md:text-lg leading-relaxed text-white">{children}</p>
      );
    },
    [BLOCKS.HEADING_2]: (node: any, children: any) => {
      return (
        <h2 className="text-2xl md:text-3xl text-gold font-bold mt-10 mb-4 border-b border-gold/40 pb-2">
          {children}
        </h2>
      );
    },
    [BLOCKS.HEADING_3]: (node: any, children: any) => {
      return (
        <h3 className="text-xl md:text-2xl text-gold font-semibold mb-3 mt-8">
          {children}
        </h3>
      );
    },
    [BLOCKS.UL_LIST]: (node: any, children: any) => {
      return (
        <ul className="list-disc pl-6 mb-6 text-base md:text-lg leading-relaxed text-white space-y-2">
          {children}
        </ul>
      );
    },
    [BLOCKS.OL_LIST]: (node: any, children: any) => {
      return (
        <ol className="list-decimal pl-6 mb-6 text-base md:text-lg leading-relaxed text-white space-y-2">
          {children}
        </ol>
      );
    },
    [BLOCKS.LIST_ITEM]: (node: any, children: any) => {
      return <li className="text-white">{children}</li>;
    },
    [BLOCKS.QUOTE]: (node: any, children: any) => {
      return (
        <blockquote className="border-l-4 border-gold pl-4 italic my-6 text-white">
          {children}
        </blockquote>
      );
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
