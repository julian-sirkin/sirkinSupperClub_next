"use client";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { EVENT_RICHTEXT_OPTIONS } from "./EventRichTextOptions";
import type { Document } from "@contentful/rich-text-types";

export const EventLongDescription = ({
  description,
}: {
  description: Document;
}) => {
  return (
    <section
      id="description"
      className="text-gold h-auto w-auto md:w-11/12 mx-auto bg:black px-4"
    >
      {documentToReactComponents(description, EVENT_RICHTEXT_OPTIONS)}
    </section>
  );
};
