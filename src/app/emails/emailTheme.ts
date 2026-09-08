/**
 * Shared palette for every outbound email.
 *
 * Values are tuned for contrast against the dark card background: the gold and
 * body-text tones all clear WCAG AA on `cardBackground`, which the older
 * `#B4945F` and `#7F734E` golds did not.
 */
export const emailColors = {
  pageBackground: "#000000",
  cardBackground: "#0E0E0E",
  panelBackground: "#1A1713",
  border: "#C6A464",
  subtleBorder: "#3A342A",
  heading: "#E8C98A",
  accent: "#E8C98A",
  bodyText: "#F4F0E8",
  mutedText: "#C7C0B2",
  buttonBackground: "#E8C98A",
  buttonText: "#000000",
} as const;

export const emailFontStack = "Arial, Helvetica, sans-serif";

export const emailTextStyles = {
  paragraph: `margin:0 0 16px 0;color:${emailColors.bodyText};font-size:16px;line-height:1.7;font-family:${emailFontStack};`,
  heading: `margin:0 0 16px 0;color:${emailColors.heading};font-size:24px;line-height:1.3;font-family:${emailFontStack};`,
  listItem: `margin:0 0 10px 0;color:${emailColors.bodyText};font-size:16px;line-height:1.7;font-family:${emailFontStack};`,
  link: `color:${emailColors.accent};text-decoration:underline;`,
  muted: `margin:0;color:${emailColors.mutedText};font-size:14px;line-height:1.6;font-family:${emailFontStack};`,
} as const;
