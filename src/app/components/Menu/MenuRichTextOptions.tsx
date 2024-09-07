import Link from "next/link";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";

export const MENU_RICH_TEXT_OPTIONS = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return (
        <p className="p-2 md:p4 text-lg md:text-2xl text-center md:text-left">
          {children}
        </p>
      );
    },
    [INLINES.HYPERLINK]: (node: any, children: any) => {
      return <Link href={node.data.uri}>{children}</Link>;
    },
  },
  renderMark: {
    [MARKS.BOLD]: (text: any) => {
      return <span className="text-white font-bold">{text}</span>;
    },
  },
};
