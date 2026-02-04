import { requireValid } from "../src/utils/validation";

const okResult = <T>(value: T) => ({ ok: true as const, value });
const errResult = (message: string) => ({ ok: false as const, message });

describe("requireValid", () => {
  test("returns value when ok", () => {
    const value = requireValid(okResult("abc"), "field");
    expect(value).toBe("abc");
  });

  test("throws HttpError when not ok", () => {
    expect(() => requireValid(errResult("bad"), "field")).toThrow("bad");
  });
});
