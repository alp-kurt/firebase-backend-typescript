import request from "supertest";
import { Timestamp } from "firebase-admin/firestore";
import { app } from "../src/app";
import type { Session } from "../src/types/session";
import {
  createSession,
  getSession,
  updateSessionStatus
} from "../src/services/sessions.service";

jest.mock("../src/services/sessions.service", () => ({
  createSession: jest.fn(),
  getSession: jest.fn(),
  updateSessionStatus: jest.fn()
}));

const mockCreateSession = createSession as jest.MockedFunction<typeof createSession>;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockUpdateSessionStatus = updateSessionStatus as jest.MockedFunction<typeof updateSessionStatus>;

const makeSession = (overrides?: Partial<Session>): Session => ({
  sessionId: "abc123",
  region: "eu-central",
  status: "pending",
  createdAt: Timestamp.fromDate(new Date("2026-02-04T00:00:00.000Z")),
  updatedAt: Timestamp.fromDate(new Date("2026-02-04T00:00:00.000Z")),
  ...overrides
});

describe("session handlers", () => {
  test("POST /api/sessions returns 201", async () => {
    mockCreateSession.mockResolvedValue(makeSession());

    const res = await request(app)
      .post("/api/sessions")
      .send({ region: "eu-central" });

    expect(res.status).toBe(201);
    expect(res.body.sessionId).toBe("abc123");
    expect(res.body.status).toBe("pending");
  });

  test("POST /api/sessions returns 400 for invalid body", async () => {
    const res = await request(app)
      .post("/api/sessions")
      .send({ region: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("invalid_argument");
  });

  test("GET /api/sessions/:id returns 404 when missing", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/sessions/missing");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("not_found");
  });

  test("PATCH /api/sessions/:id/status returns 400 for invalid status", async () => {
    const res = await request(app)
      .patch("/api/sessions/abc123/status")
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
      .send({ status: "active" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("active");
  });
});
