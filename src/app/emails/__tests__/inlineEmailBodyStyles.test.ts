import { emailColors } from "../emailTheme";
import { inlineEmailBodyStyles } from "../inlineEmailBodyStyles";

describe("inlineEmailBodyStyles", () => {
  it("gives bare paragraphs an explicit colour so email clients cannot strip it", () => {
    const result = inlineEmailBodyStyles("<p>Dinner is served at six.</p>");

    expect(result).toContain(`color:${emailColors.bodyText}`);
  });

  it("keeps a colour the admin chose in the editor", () => {
    const result = inlineEmailBodyStyles('<p style="color:#ff0000">Important</p>');

    expect(result).toContain("color:#ff0000");
    expect(result).not.toContain(`color:${emailColors.bodyText}`);
  });

  it("fills in declarations the admin did not set without discarding theirs", () => {
    const result = inlineEmailBodyStyles('<p style="color:#ff0000">Important</p>');

    expect(result).toContain("color:#ff0000");
    expect(result).toContain("line-height:1.7");
  });

  it("styles links and headings with the brand gold", () => {
    const result = inlineEmailBodyStyles(
      '<h2>Details</h2><a href="https://example.com">Pay</a>'
    );

    expect(result).toContain(`color:${emailColors.heading}`);
    expect(result).toContain(`color:${emailColors.accent}`);
  });

  it("preserves attributes on the tags it rewrites", () => {
    const result = inlineEmailBodyStyles('<a href="https://example.com">Pay</a>');

    expect(result).toContain('href="https://example.com"');
  });

  it("leaves tags it does not manage untouched", () => {
    const result = inlineEmailBodyStyles("<table><tr><td>Kept as is</td></tr></table>");

    expect(result).toBe("<table><tr><td>Kept as is</td></tr></table>");
  });

  it("returns an empty string for empty input", () => {
    expect(inlineEmailBodyStyles("")).toBe("");
  });
});
