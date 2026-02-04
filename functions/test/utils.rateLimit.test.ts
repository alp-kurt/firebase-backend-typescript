import type { Request, Response, NextFunction } from "express";
import { rateLimit } from "../src/utils/rateLimit";

type ResponseLike = {
  statusCode: number;
  locals: Record<string, unknown>;
  status: (code: number) => ResponseLike;
  json: (body: unknown) => unknown;
};

const makeRes = (): Response => {
  const res: ResponseLike = {
    statusCode: 200,
    locals: {},
    status: jest.fn(function (this: ResponseLike, code: number) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function (this: ResponseLike, body: unknown) {
      return body;
    })
  };
  return res as unknown as Response;
};

describe("rateLimit", () => {
  test("allows up to max and blocks after", () => {
    const limiter = rateLimit({ windowMs: 1000, max: 2 });
    const req = { ip: "1.1.1.1" } as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    limiter(req, res, next);
    limiter(req, res, next);
    limiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toBe(429);
  });
});
