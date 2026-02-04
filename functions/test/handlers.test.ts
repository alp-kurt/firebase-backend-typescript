import request from "supertest";
import { Timestamp } from "firebase-admin/firestore";
import { app } from "../src/app";
import type { Session } from "../src/types/session";
import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
  updateSessionRegion,
  updateSessionStatus
} from "../src/services/sessions.service";

jest.mock("../src/services/sessions.service", () => ({
  createSession: jest.fn(),
  deleteSession: jest.fn(),
  getSession: jest.fn(),
  listSessions: jest.fn(),
  updateSessionRegion: jest.fn(),
  updateSessionStatus: jest.fn()
}));

const verifyIdTokenMock = jest.fn();

jest.mock("firebase-admin", () => ({
  auth: () => ({
    verifyIdToken: verifyIdTokenMock
  })
}));

const mockCreateSession = createSession as jest.MockedFunction<typeof createSession>;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockUpdateSessionStatus = updateSessionStatus as jest.MockedFunction<typeof updateSessionStatus>;
const mockListSessions = listSessions as jest.MockedFunction<typeof listSessions>;
const mockUpdateSessionRegion = updateSessionRegion as jest.MockedFunction<typeof updateSessionRegion>;
const mockDeleteSession = deleteSession as jest.MockedFunction<typeof deleteSession>;

const makeSession = (overrides?: Partial<Session>): Session => ({
  sessionId: "abc123",
  region: "eu-central",
  status: "pending",
  createdAt: Timestamp.fromDate(new Date("2026-02-04T00:00:00.000Z")),
  updatedAt: Timestamp.fromDate(new Date("2026-02-04T00:00:00.000Z")),
  ...overrides
});

const authHeader = (): string => "Bearer test-token";

describe("session handlers", () => {
  beforeEach(() => {
    verifyIdTokenMock.mockResolvedValue({ uid: "admin-user" });
  });

  test("POST /api/sessions returns 201", async () => {
    mockCreateSession.mockResolvedValue(makeSession());

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", authHeader())
      .send({ region: "eu-central" });

    expect(res.status).toBe(201);
    expect(res.body.sessionId).toBe("abc123");
    expect(res.body.status).toBe("pending");
  });

  test("POST /api/sessions returns 400 for invalid body", async () => {
    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", authHeader())
      .send({ region: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("invalid_argument");
  });

  test("GET /api/sessions/:id returns 404 when missing", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/sessions/missing")
      .set("Authorization", authHeader());

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("not_found");
  });

  test("PATCH /api/sessions/:id/status returns 400 for invalid status", async () => {
    const res = await request(app)
      .patch("/api/sessions/abc123/status")
      .set("Authorization", authHeader())
      .send({ status: "bad" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("invalid_argument");
  });

  test("PATCH /api/sessions/:id/status returns 200", async () => {
    mockUpdateSessionStatus.mockResolvedValue(
      makeSession({ status: "active" })
    );

    const res = await request(app)
      .patch("/api/sessions/abc123/status")
      .set("Authorization", authHeader())
      .send({ status: "active" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("active");
  });

  test("GET /api/sessions lists sessions", async () => {
    const session = makeSession({ sessionId: "s1" });
    const session2 = makeSession({ sessionId: "s2", status: "active" });
    mockListSessions.mockResolvedValue([session, session2]);

    const res = await request(app)
      .get("/api/sessions")
      .set("Authorization", authHeader())
      .query({ status: "active", region: "eu-central" });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test("PATCH /api/sessions/:id updates region", async () => {
    mockUpdateSessionRegion.mockResolvedValue(makeSession({ region: "us-east" }));

    const res = await request(app)
      .patch("/api/sessions/abc123")
      .set("Authorization", authHeader())
      .send({ region: "us-east" });

    expect(res.status).toBe(200);
    expect(res.body.region).toBe("us-east");
  });

  test("POST /api/sessions/:id/complete sets completed", async () => {
    mockUpdateSessionStatus.mockResolvedValue(
      makeSession({ status: "completed" })
    );

    const res = await request(app)
      .post("/api/sessions/abc123/complete")
      .set("Authorization", authHeader());

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("completed");
  });

  test("POST /api/sessions/:id/fail sets failed", async () => {
    mockUpdateSessionStatus.mockResolvedValue(
      makeSession({ status: "failed" })
    );

    const res = await request(app)
      .post("/api/sessions/abc123/fail")
      .set("Authorization", authHeader());

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("failed");
  });

  test("DELETE /api/sessions/:id returns 204", async () => {
    mockDeleteSession.mockResolvedValue(true);

    const res = await request(app)
      .delete("/api/sessions/abc123")
      .set("Authorization", authHeader());

    expect(res.status).toBe(204);
  });

  test("requests without auth are rejected", async () => {
    const res = await request(app)
      .post("/api/sessions")
      .send({ region: "eu-central" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("unauthenticated");
  });

  test("requests with invalid token are rejected", async () => {
    verifyIdTokenMock.mockRejectedValue(new Error("bad token"));

    const res = await request(app)
      .post("/api/sessions")
      .send({ region: "eu-central" })
      .set("Authorization", "Bearer invalid");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("unauthenticated");
  });

  test("returns 405 for unsupported method", async () => {
    const res = await request(app)
      .put("/api/sessions")
      .set("Authorization", authHeader());

    expect(res.status).toBe(405);
    expect(res.body.error.code).toBe("method_not_allowed");
    expect(res.body.error.details.allowed).toContain("GET");
  });

  test("returns 400 for invalid JSON body", async () => {
    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", authHeader())
      .set("Content-Type", "application/json")
      .send("{\"region\":");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("invalid_argument");
  });

});
