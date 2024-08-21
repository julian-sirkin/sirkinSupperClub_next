import Link from "next/link";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";

export const EVENT_RICHTEXT_OPTIONS = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return (
        <p className="md:p4 mb-2 md:mb-4 text-lg md:text-2xl">{children}</p>
      );
    },
    [INLINES.HYPERLINK]: (node: any, children: any) => {
      return <Link href={node.data.uri}>{children}</Link>;
    },
  },
};
