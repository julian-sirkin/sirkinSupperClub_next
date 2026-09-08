import { optionalText } from "../optionalText";

describe("optionalText", () => {
  it("returns the trimmed string when there is real content", () => {
    expect(optionalText("  fish allergy  ")).toBe("fish allergy");
  });

  it("returns null for empty or whitespace-only input", () => {
    expect(optionalText("")).toBeNull();
    expect(optionalText("   ")).toBeNull();
  });

  it("returns null for non-strings", () => {
    expect(optionalText(undefined)).toBeNull();
    expect(optionalText(null)).toBeNull();
    expect(optionalText(12)).toBeNull();
  });
});
