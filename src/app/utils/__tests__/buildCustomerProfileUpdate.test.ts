import { buildCustomerProfileUpdate } from "../buildCustomerProfileUpdate";

describe("buildCustomerProfileUpdate", () => {
  it("keeps a newly provided allergy and note", () => {
    expect(
      buildCustomerProfileUpdate({
        name: "Jane",
        phoneNumber: "1234567890",
        notes: "window seat",
        dietaryRestrictions: "fish allergy",
      })
    ).toEqual({
      name: "Jane",
      phoneNumber: "1234567890",
      notes: "window seat",
      dietaryRestrictions: "fish allergy",
    });
  });

  it("does not blank standing notes or dietary restrictions when this checkout left them empty", () => {
    expect(
      buildCustomerProfileUpdate({
        name: "Jane",
        phoneNumber: "1234567890",
        notes: null,
        dietaryRestrictions: null,
      })
    ).toEqual({
      name: "Jane",
      phoneNumber: "1234567890",
    });
  });

  it("returns an empty object when nothing should change", () => {
    expect(buildCustomerProfileUpdate({})).toEqual({});
  });
});
