import { emailColors, emailFontStack } from "@/app/emails/emailTheme";

const SITE_URL = "https://sirkinsupperclub.com";
const CONTACT_EMAIL = "sirkinsupperclub@gmail.com";

const FOOTER_LINKS = [
  { label: "TikTok", url: "https://www.tiktok.com/@sirkinsupperclub" },
  { label: "Supper Club Instagram", url: "https://www.instagram.com/sirkinsupperclub/" },
  { label: "Chef's Instagram", url: "https://www.instagram.com/julian.sirkin/" },
  { label: "Email Us", url: `mailto:${CONTACT_EMAIL}` },
];

const footerLinkStyle = `color:${emailColors.accent};text-decoration:underline;display:inline-block;margin:5px 10px;font-size:14px;font-family:${emailFontStack};`;

const renderFooterLinks = () =>
  FOOTER_LINKS.map(
    ({ label, url }) => `<a href="${url}" style="${footerLinkStyle}">${label}</a>`
  ).join("");

const renderEventButton = (eventUrl?: string) => {
  if (!eventUrl) {
    return "";
  }

  return `<a href="${eventUrl}" style="display:inline-block;background-color:transparent;color:${emailColors.accent};text-decoration:none;padding:10px 20px;border-radius:5px;font-weight:bold;margin:10px;border:1px solid ${emailColors.border};font-family:${emailFontStack};">View This Event</a>`;
};

/**
 * Shared shell for every outbound email.
 *
 * Colour is declared on each element rather than inherited from a wrapper, and
 * background colours are set with both `bgcolor` and inline styles, because
 * Gmail and Outlook strip inherited declarations and would otherwise render
 * light text on a light background.
 */
export const wrapEmailContent = (
  content: string,
  signOff: string = "Best,",
  eventUrl?: string
) => {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${emailColors.pageBackground}" style="width:100%;background-color:${emailColors.pageBackground};margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:40px 20px;background-color:${emailColors.pageBackground};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:680px;">
            <tr>
              <td bgcolor="${emailColors.cardBackground}" style="background-color:${emailColors.cardBackground};border:2px solid ${emailColors.border};border-radius:8px;padding:30px;color:${emailColors.bodyText};font-family:${emailFontStack};font-size:16px;line-height:1.7;">
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding:20px 0 0 20px;color:${emailColors.accent};font-style:italic;font-family:${emailFontStack};font-size:16px;">
                ${signOff}
              </td>
            </tr>

            <tr>
              <td align="center" style="border-top:2px solid ${emailColors.border};padding-top:20px;margin-top:20px;text-align:center;">
                <p style="margin:0 0 15px 0;font-size:18px;color:${emailColors.accent};font-family:${emailFontStack};">
                  Julian Sirkin
                </p>

                <p style="margin:20px 0;">
                  <a href="${SITE_URL}" style="display:inline-block;background-color:${emailColors.buttonBackground};color:${emailColors.buttonText};text-decoration:none;padding:10px 20px;border-radius:5px;font-weight:bold;margin:10px;font-family:${emailFontStack};">
                    Visit Sirkin Supper Club
                  </a>
                  ${renderEventButton(eventUrl)}
                </p>

                <p style="margin:20px 0 15px 0;color:${emailColors.mutedText};font-size:14px;font-family:${emailFontStack};">
                  Follow Us
                </p>
                <p style="margin:0;">
                  ${renderFooterLinks()}
                </p>

                <p style="margin-top:20px;font-size:12px;color:${emailColors.mutedText};font-family:${emailFontStack};">
                  &copy; ${new Date().getFullYear()} Sirkin Supper Club. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};
