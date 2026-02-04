import { validateRegion, validateSessionId, validateStatus } from "../src/validation";

describe("validation", () => {
  test("rejects empty region", () => {
    const result = validateRegion("  ");
    expect(result.ok).toBe(false);
  });

  test("accepts valid region", () => {
    const result = validateRegion("eu-central");
    expect(result.ok).toBe(true);
  });

  test("rejects invalid status", () => {
    const result = validateStatus("bad-status");
    expect(result.ok).toBe(false);
  });

  test("accepts valid status", () => {
    const result = validateStatus("active");
    expect(result.ok).toBe(true);
  });

  test("rejects empty sessionId", () => {
    const result = validateSessionId("");
    expect(result.ok).toBe(false);
  });
});
