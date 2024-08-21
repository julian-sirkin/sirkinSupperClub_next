import Link from "next/link";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";

export const MENU_RICH_TEXT_OPTIONS = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return <p className="p4 mt-2 text-2xl">{children}</p>;
    },
    [INLINES.HYPERLINK]: (node: any, children: any) => {
      return <Link href={node.data.uri}>{children}</Link>;
    },
  },
};
