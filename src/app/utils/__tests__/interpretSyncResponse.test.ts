import { interpretSyncResponse } from "../interpretSyncResponse";

describe("interpretSyncResponse", () => {
  it("treats a 200 as success", () => {
    expect(interpretSyncResponse(200, { message: "Events synchronized successfully" })).toEqual({
      ok: true,
      kind: "success",
      message: "Events synchronized successfully",
    });
  });

  it("treats a 200 with warnings as a warning, not a failure", () => {
    expect(interpretSyncResponse(200, { warnings: ["ticket skipped"] })).toEqual({
      ok: true,
      kind: "warning",
      message: "Events synced, with 1 warning.",
    });
  });

  it("asks the user to log in again on 401", () => {
    expect(interpretSyncResponse(401, {})).toEqual({
      ok: false,
      kind: "error",
      message: "Please log in again to sync events.",
    });
  });

  it("surfaces a server error message", () => {
    expect(interpretSyncResponse(500, { error: "Contentful timed out" })).toEqual({
      ok: false,
      kind: "error",
      message: "Contentful timed out",
    });
  });
});
