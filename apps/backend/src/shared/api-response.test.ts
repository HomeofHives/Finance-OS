import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import Fastify, { type FastifyInstance } from "fastify";
import { z } from "zod";
import { createApiErrorResponse, createApiSuccess } from "./api-response.js";
import { registerErrorHandler } from "./error-handler.js";
import { HttpError } from "./http-error.js";

const sampleSchema = z.object({ email: z.string().min(1, "Email is required.") });

let app: FastifyInstance;

function buildApp(): FastifyInstance {
   const server = Fastify({ logger: false });
   registerErrorHandler(server);
   server.get("/ok", async () => createApiSuccess({ message: "all good" }));
   server.get("/list", async () => createApiSuccess([1, 2, 3], { page: 1, total: 3 }));
   server.get("/http-error", async () => {
      throw new HttpError(403, "FORBIDDEN", "Not allowed.");
   });
   server.post("/validate", async (request) => {
      sampleSchema.parse(request.body);
      return createApiSuccess({ ok: true });
   });
   server.post("/echo", async (request) => createApiSuccess(request.body));
   server.get("/boom", async () => {
      throw new Error("sensitive internal detail");
   });
   return server;
}

beforeEach(() => {
   app = buildApp();
});

afterEach(async () => {
   await app.close();
});

describe("createApiSuccess", () => {
   test("returns a bare success envelope without meta", () => {
      assert.deepEqual(createApiSuccess({ message: "ok" }), {
         success: true,
         data: { message: "ok" },
      });
   });

   test("includes meta when provided", () => {
      assert.deepEqual(createApiSuccess([1, 2, 3], { total: 3 }), {
         success: true,
         data: [1, 2, 3],
         meta: { total: 3 },
      });
   });
});

describe("createApiErrorResponse", () => {
   test("produces a minimal error envelope", () => {
      assert.deepEqual(createApiErrorResponse("BAD_REQUEST", "Request could not be processed."), {
         success: false,
         error: { code: "BAD_REQUEST", message: "Request could not be processed." },
      });
   });

   test("includes details and requestId only when provided", () => {
      assert.deepEqual(
         createApiErrorResponse("INTERNAL_ERROR", "Something broke.", {
            details: { field: "x" },
            requestId: "req-1",
         }),
         {
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Something broke.", details: { field: "x" } },
            requestId: "req-1",
         },
      );
   });
});

describe("standardized success responses", () => {
   test("returns a bare success envelope on success", async () => {
      const response = await app.inject({ method: "GET", url: "/ok" });
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.json(), {
         success: true,
         data: { message: "all good" },
      });
   });

   test("returns success with meta for collection-like payloads", async () => {
      const response = await app.inject({ method: "GET", url: "/list" });
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.json(), {
         success: true,
         data: [1, 2, 3],
         meta: { page: 1, total: 3 },
      });
   });
});

describe("validation error envelope", () => {
   test("returns 400 with a standardized validation error", async () => {
      const response = await app.inject({
         method: "POST",
         url: "/validate",
         payload: { email: "" },
      });
      assert.equal(response.statusCode, 400);
      const body = response.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "VALIDATION_ERROR");
      assert.equal(body.error.message, "Invalid request payload.");
      assert.ok(Array.isArray(body.error.details));
      assert.equal(body.error.details.length, 1);
      assert.equal(body.error.details[0].path, "email");
   });
});

describe("HttpError envelope", () => {
   test("serializes HttpError through the shared formatter", async () => {
      const response = await app.inject({ method: "GET", url: "/http-error" });
      assert.equal(response.statusCode, 403);
      assert.deepEqual(response.json(), {
         success: false,
         error: { code: "FORBIDDEN", message: "Not allowed." },
      });
   });
});

describe("unexpected 500 envelope", () => {
   test("returns 500 without leaking internal details and includes requestId", async () => {
      const response = await app.inject({ method: "GET", url: "/boom" });
      assert.equal(response.statusCode, 500);
      const body = response.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "INTERNAL_ERROR");
      assert.equal(body.error.message, "An unexpected error occurred.");
      assert.equal(typeof body.requestId, "string");
      assert.ok(body.requestId, "requestId is populated");
      assert.ok(!response.body.includes("sensitive"), "internal details are not exposed");
   });
});

describe("fastify/client 4xx envelope", () => {
   test("standardizes a client 4xx body-parse error", async () => {
      const response = await app.inject({
         method: "POST",
         url: "/echo",
         headers: { "content-type": "application/json" },
         payload: "{definitely not json",
      });
      assert.equal(response.statusCode, 400);
      const body = response.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "BAD_REQUEST");
      assert.equal(typeof body.requestId, "string");
   });

   test("standardizes a 404 for unknown routes", async () => {
      const response = await app.inject({ method: "GET", url: "/missing-route" });
      assert.equal(response.statusCode, 404);
      const body = response.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "NOT_FOUND");
      assert.equal(body.error.message, "Route not found.");
      assert.equal(typeof body.requestId, "string");
   });
});
