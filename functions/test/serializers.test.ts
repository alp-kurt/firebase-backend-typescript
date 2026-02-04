import { Timestamp } from "firebase-admin/firestore";
import { serializeSession, serializeDeletedSession } from "../src/utils/serializers";
import type { Session } from "../src/types/session";
import type { DeletedSession } from "../src/types/deletedSession";

describe("serializers", () => {
  test("serializeSession converts timestamps", () => {
    const session: Session = {
      sessionId: "s1",
      region: "eu-central",
      status: "pending",
      createdAt: Timestamp.fromDate(new Date("2026-02-04T00:00:00.000Z")),
      updatedAt: Timestamp.fromDate(new Date("2026-02-04T00:00:00.000Z"))
    };

    const result = serializeSession(session);
    expect(result.createdAt).toBe("2026-02-04T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-02-04T00:00:00.000Z");
  });

  test("serializeDeletedSession converts timestamps", () => {
    const deleted: DeletedSession = {
      sessionId: "s2",
      region: "us-east",
      status: "failed",
      createdAt: Timestamp.fromDate(new Date("2026-02-01T00:00:00.000Z")),
      updatedAt: Timestamp.fromDate(new Date("2026-02-02T00:00:00.000Z")),
      deletedAt: Timestamp.fromDate(new Date("2026-02-03T00:00:00.000Z")),
      expiresAt: Timestamp.fromDate(new Date("2026-02-04T00:00:00.000Z"))
    };

    const result = serializeDeletedSession(deleted);
    expect(result.deletedAt).toBe("2026-02-03T00:00:00.000Z");
    expect(result.expiresAt).toBe("2026-02-04T00:00:00.000Z");
  });
});
