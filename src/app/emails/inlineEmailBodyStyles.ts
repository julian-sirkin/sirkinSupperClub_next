import { emailColors, emailFontStack } from "./emailTheme";

/**
 * Rich-text editors emit bare tags (`<p>`, `<li>`, `<a>`) that rely on inherited
 * colour. Gmail and Outlook routinely drop the wrapper's colour declarations,
 * which leaves dark-on-dark or white-on-white text. Every tag therefore gets its
 * own inline colour before the email goes out.
 */
const TAG_STYLES: Record<string, string> = {
  p: `margin:0 0 16px 0;color:${emailColors.bodyText};font-size:16px;line-height:1.7;font-family:${emailFontStack};`,
  h1: `margin:0 0 16px 0;color:${emailColors.heading};font-size:26px;line-height:1.3;font-family:${emailFontStack};`,
  h2: `margin:0 0 14px 0;color:${emailColors.heading};font-size:22px;line-height:1.3;font-family:${emailFontStack};`,
  h3: `margin:0 0 12px 0;color:${emailColors.heading};font-size:19px;line-height:1.3;font-family:${emailFontStack};`,
  ul: `margin:0 0 16px 0;padding-left:22px;color:${emailColors.bodyText};font-family:${emailFontStack};`,
  ol: `margin:0 0 16px 0;padding-left:22px;color:${emailColors.bodyText};font-family:${emailFontStack};`,
  li: `margin:0 0 8px 0;color:${emailColors.bodyText};font-size:16px;line-height:1.7;font-family:${emailFontStack};`,
  a: `color:${emailColors.accent};text-decoration:underline;`,
  strong: `color:${emailColors.heading};font-weight:bold;`,
  em: `color:${emailColors.bodyText};`,
  blockquote: `margin:0 0 16px 0;padding-left:16px;border-left:3px solid ${emailColors.border};color:${emailColors.mutedText};font-family:${emailFontStack};`,
};

const STYLE_ATTRIBUTE_PATTERN = /style\s*=\s*(["'])(.*?)\1/i;

/**
 * Author-supplied styles win, so a colour picked in the editor is preserved and
 * only the declarations it left out are filled in from the theme.
 */
const mergeStyles = (existingStyle: string, defaultStyle: string) => {
  const declaredProperties = new Set(
    existingStyle
      .split(";")
      .map((declaration) => declaration.split(":")[0]?.trim().toLowerCase())
      .filter(Boolean)
  );

  const missingDeclarations = defaultStyle
    .split(";")
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration.length > 0)
    .filter((declaration) => {
      const property = declaration.split(":")[0]?.trim().toLowerCase();
      return property ? !declaredProperties.has(property) : false;
    });

  if (missingDeclarations.length === 0) {
    return existingStyle;
  }

  const normalizedExisting = existingStyle.trim().replace(/;$/, "");
  return `${normalizedExisting};${missingDeclarations.join(";")};`;
};

export const inlineEmailBodyStyles = (bodyHtml: string): string => {
  if (!bodyHtml) {
    return "";
  }

  const tagNames = Object.keys(TAG_STYLES).join("|");
  const openingTagPattern = new RegExp(`<(${tagNames})(\\s[^>]*)?>`, "gi");

  return bodyHtml.replace(openingTagPattern, (fullMatch, tagName: string, attributes = "") => {
    const defaultStyle = TAG_STYLES[tagName.toLowerCase()];
    const existingAttributes = attributes ?? "";
    const existingStyleMatch = existingAttributes.match(STYLE_ATTRIBUTE_PATTERN);

    if (!existingStyleMatch) {
      return `<${tagName}${existingAttributes} style="${defaultStyle}">`;
    }

    const mergedStyle = mergeStyles(existingStyleMatch[2], defaultStyle);
    const attributesWithMergedStyle = existingAttributes.replace(
      STYLE_ATTRIBUTE_PATTERN,
      `style="${mergedStyle}"`
    );

    return `<${tagName}${attributesWithMergedStyle}>`;
  });
};
