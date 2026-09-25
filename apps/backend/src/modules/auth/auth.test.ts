import assert from "node:assert/strict";
import { createHash, generateKeyPairSync } from "node:crypto";
import type { OutgoingHttpHeaders } from "node:http";
import { afterEach, beforeEach, describe, test } from "node:test";
import Fastify, { type FastifyInstance } from "fastify";
import {
   authenticationPlugin,
   type AuthenticationPluginOptions,
} from "../../plugins/authentication.plugin.js";
import { securityPlugin } from "../../plugins/security.plugin.js";
import { authPlugin, type AuthPluginOptions } from "./auth.plugin.js";
import { registerErrorHandler } from "../../shared/error-handler.js";
import { createLegacyScryptHash } from "./password.service.js";
import {
   DuplicateUserError,
   type AuthRepository,
   type AuthSessionInput,
   type AuthUserInput,
   type RefreshSessionRecord,
   type RotateRefreshSessionInput,
   type UserRecord,
} from "./auth.types.js";

const CLOCK_START = Date.parse("2026-01-01T00:00:00.000Z");
const ACCESS_TTL_SECONDS = 600;
const REFRESH_TTL_SECONDS = 3600;
const COOKIE_NAME = "fos_refresh";
const ALLOWED_ORIGIN = "https://app.example.test";
const PASSWORD = "supersecret123";

function createKeyPair() {
   return generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
   });
}

const keyPair = createKeyPair();

class MemoryRepository implements AuthRepository {
   users: UserRecord[] = [];
   sessions: RefreshSessionRecord[] = [];
   private nextUserId = 0;
   private nextSessionId = 0;

   async findUserByEmail(email: string): Promise<UserRecord | null> {
      return this.users.find((user) => user.email === email) ?? null;
   }

   async findUserById(id: string): Promise<UserRecord | null> {
      return this.users.find((user) => user._id === id) ?? null;
   }

   async createUser(input: AuthUserInput): Promise<UserRecord> {
      if (this.users.some((user) => user.email === input.email)) {
         throw new DuplicateUserError();
      }
      const timestamp = new Date(CLOCK_START);
      const user: UserRecord = {
         _id: String(++this.nextUserId),
         name: input.name,
         email: input.email,
         passwordHash: input.passwordHash,
         createdAt: timestamp,
         updatedAt: timestamp,
      };
      this.users.push(user);
      return user;
   }

   async updateUserPasswordHash(userId: string, passwordHash: string): Promise<void> {
      const user = this.users.find((candidate) => candidate._id === userId);
      if (!user) throw new Error("User not found");
      user.passwordHash = passwordHash;
      user.updatedAt = new Date(CLOCK_START + 1);
   }

   async createRefreshSession(input: AuthSessionInput): Promise<RefreshSessionRecord> {
      const timestamp = new Date(CLOCK_START);
      const session: RefreshSessionRecord = {
         _id: String(++this.nextSessionId),
         userId: input.userId,
         refreshTokenHash: input.refreshTokenHash,
         familyId: input.familyId,
         expiresAt: input.expiresAt,
         createdAt: timestamp,
         updatedAt: timestamp,
         lastUsedAt: input.lastUsedAt,
         revokedAt: null,
         replacedBySessionId: null,
      };
      this.sessions.push(session);
      return session;
   }

   async findRefreshSessionByTokenHash(
      refreshTokenHash: string,
   ): Promise<RefreshSessionRecord | null> {
      return this.sessions.find((session) => session.refreshTokenHash === refreshTokenHash) ?? null;
   }

   async rotateRefreshSession(
      input: RotateRefreshSessionInput,
   ): Promise<RefreshSessionRecord | null> {
      const previous = this.sessions.find(
         (session) =>
            session._id === input.sessionId &&
            session.refreshTokenHash === input.previousRefreshTokenHash &&
            session.userId === input.userId &&
            session.familyId === input.familyId &&
            session.revokedAt === null &&
            session.replacedBySessionId === null &&
            session.expiresAt.getTime() > input.now.getTime(),
      );
      if (!previous) return null;
      const claimId = `pending:${input.refreshTokenHash}`;
      previous.lastUsedAt = input.now;
      previous.replacedBySessionId = claimId;
      try {
         const replacement = await this.createRefreshSession({
            userId: input.userId,
            refreshTokenHash: input.refreshTokenHash,
            familyId: input.familyId,
            expiresAt: input.expiresAt,
            lastUsedAt: input.now,
         });
         previous.replacedBySessionId = replacement._id;
         previous.revokedAt = input.now;
         return replacement;
      } catch (error) {
         previous.revokedAt = input.now;
         throw error;
      }
   }

   async revokeRefreshFamily(familyId: string, revokedAt: Date): Promise<void> {
      for (const session of this.sessions) {
         if (session.familyId === familyId && session.revokedAt === null)
            session.revokedAt = revokedAt;
      }
   }
}

let repository: MemoryRepository;
let app: FastifyInstance;
let now = CLOCK_START;

function authenticationOptions(
   overrides: Partial<AuthenticationPluginOptions> = {},
): AuthenticationPluginOptions {
   return {
      repository,
      issuer: "test-issuer",
      audience: "test-audience",
      currentKeyId: "test-key",
      keys: {
         "test-key": {
            keyId: "test-key",
            privateKey: keyPair.privateKey,
            publicKey: keyPair.publicKey,
         },
      },
      accessTokenTtlSeconds: ACCESS_TTL_SECONDS,
      refreshTokenTtlSeconds: REFRESH_TTL_SECONDS,
      cookieName: COOKIE_NAME,
      cookiePath: "/api/auth",
      cookieSecure: false,
      cookieSameSite: "strict",
      now: () => now,
      ...overrides,
   };
}

function authRouteOptions(overrides: Partial<AuthPluginOptions> = {}): AuthPluginOptions {
   return {
      loginRateLimit: 100,
      registerRateLimit: 100,
      refreshRateLimit: 100,
      rateLimitWindowSeconds: 60,
      ...overrides,
   };
}

type RegisterSiblingPlugin = (server: FastifyInstance) => void;

async function buildTestApp(
   infrastructureOptions: Partial<AuthenticationPluginOptions> = {},
   routeOptions: Partial<AuthPluginOptions> = {},
   registerSiblingPlugin?: RegisterSiblingPlugin,
): Promise<FastifyInstance> {
   const server = Fastify({ logger: false });
   registerErrorHandler(server);
   server.register(securityPlugin, {
      allowedOrigins: [ALLOWED_ORIGIN],
      rateLimitWindowSeconds: 60,
   });
   server.register(authenticationPlugin, authenticationOptions(infrastructureOptions));
   registerSiblingPlugin?.(server);
   server.register(authPlugin, { prefix: "/api/auth", ...authRouteOptions(routeOptions) });
   await server.ready();
   return server;
}

function cookieValue(response: { headers: OutgoingHttpHeaders }): string {
   const header = response.headers["set-cookie"];
   const value = Array.isArray(header) ? header[0] : header;
   assert.ok(value);
   return value.split(";", 1)[0].split("=", 2)[1];
}

function cookieHeader(response: { headers: OutgoingHttpHeaders }): string {
   const header = response.headers["set-cookie"];
   const value = Array.isArray(header) ? header[0] : header;
   assert.ok(value);
   return value.split(";", 1)[0];
}

function rawSetCookie(response: { headers: OutgoingHttpHeaders }): string {
   const header = response.headers["set-cookie"];
   const value = Array.isArray(header) ? header[0] : header;
   assert.ok(value);
   return value;
}

const registrationPayload = (overrides: Record<string, unknown> = {}) => ({
   name: "Ada Lovelace",
   email: "ada@example.com",
   password: PASSWORD,
   ...overrides,
});

async function registerRequest(
   targetApp: FastifyInstance,
   payload: Record<string, unknown> = registrationPayload(),
   headers: Record<string, string> = {},
) {
   return targetApp.inject({ method: "POST", url: "/api/auth/register", payload, headers });
}

beforeEach(async () => {
   repository = new MemoryRepository();
   now = CLOCK_START;
   app = await buildTestApp();
});

afterEach(async () => {
   await app.close();
});

describe("registration", () => {
   test("creates an Argon2id user, access token, and hashed refresh session", async () => {
      const response = await registerRequest(app);

      assert.equal(response.statusCode, 201, response.body);
      const body = response.json();
      assert.deepEqual(Object.keys(body).sort(), ["data", "success"]);
      assert.equal(body.success, true);
      assert.equal(typeof body.data.accessToken, "string");
      assert.equal(body.data.user.email, "ada@example.com");
      assert.equal("passwordHash" in body.data.user, false);
      assert.equal("refreshToken" in body.data, false);
      assert.equal(repository.users.length, 1);
      assert.match(repository.users[0].passwordHash, /^\$argon2id\$/);
      assert.equal(repository.sessions.length, 1);

      const refreshToken = cookieValue(response);
      const storedHash = createHash("sha256").update(refreshToken).digest("hex");
      assert.equal(repository.sessions[0].refreshTokenHash, storedHash);
      assert.notEqual(repository.sessions[0].refreshTokenHash, refreshToken);
      assert.ok(!rawSetCookie(response).includes("Domain="));
      assert.match(rawSetCookie(response), /HttpOnly/);
      assert.match(rawSetCookie(response), /SameSite=Strict/);
      assert.match(rawSetCookie(response), /Max-Age=3600/);
   });

   test("uses a Secure __Host cookie in production-style configuration", async () => {
      const secureApp = await buildTestApp({
         cookieName: "__Host-fos_refresh",
         cookiePath: "/",
         cookieSecure: true,
      });
      try {
         const response = await registerRequest(secureApp);
         const rawCookie = rawSetCookie(response);

         assert.match(rawCookie, /HttpOnly/);
         assert.match(rawCookie, /Secure/);
         assert.match(rawCookie, /SameSite=Strict/);
         assert.match(rawCookie, /Path=\//);
         assert.ok(!rawCookie.includes("Domain="));
      } finally {
         await secureApp.close();
      }
   });

   test("normalizes email and rejects duplicate registration", async () => {
      await registerRequest(app, registrationPayload({ email: " ADA@Example.COM " }));
      const response = await registerRequest(app, registrationPayload({ name: "Another Ada" }));

      assert.equal(response.statusCode, 409);
      assert.deepEqual(response.json(), {
         success: false,
         error: { code: "USER_ALREADY_EXISTS", message: "A user with this email already exists." },
      });
      assert.equal(repository.users[0].email, "ada@example.com");
   });

   test("returns the validation error contract", async () => {
      const response = await registerRequest(app, {
         name: "",
         email: "invalid",
         password: "short",
      });

      assert.equal(response.statusCode, 400);
      assert.equal(response.json().success, false);
      assert.equal(response.json().error.code, "VALIDATION_ERROR");
   });
});

describe("login", () => {
   test("authenticates valid credentials and returns no refresh token in JSON", async () => {
      await registerRequest(app);
      const response = await app.inject({
         method: "POST",
         url: "/api/auth/login",
         payload: { email: "ADA@example.com", password: PASSWORD },
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.json().success, true);
      assert.equal(response.json().data.user.email, "ada@example.com");
      assert.equal(typeof response.json().data.accessToken, "string");
      assert.equal("refreshToken" in response.json().data, false);
      assert.equal(repository.sessions.length, 2);
   });

   test("does not reveal whether an account exists", async () => {
      await registerRequest(app);
      const unknown = await app.inject({
         method: "POST",
         url: "/api/auth/login",
         payload: { email: "unknown@example.com", password: PASSWORD },
      });
      const wrongPassword = await app.inject({
         method: "POST",
         url: "/api/auth/login",
         payload: { email: "ada@example.com", password: "wrongpassword1" },
      });

      assert.equal(unknown.statusCode, 401);
      assert.equal(wrongPassword.statusCode, 401);
      assert.deepEqual(unknown.json(), wrongPassword.json());
      assert.deepEqual(unknown.json(), {
         success: false,
         error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
      });
   });

   test("migrates a legacy scrypt hash only after successful verification", async () => {
      const legacyHash = createLegacyScryptHash(PASSWORD);
      repository.users.push({
         _id: "legacy-user",
         name: "Legacy User",
         email: "legacy@example.com",
         passwordHash: legacyHash,
         createdAt: new Date(CLOCK_START),
         updatedAt: new Date(CLOCK_START),
      });

      const invalid = await app.inject({
         method: "POST",
         url: "/api/auth/login",
         payload: { email: "legacy@example.com", password: "wrongpassword1" },
      });
      assert.equal(invalid.statusCode, 401);
      assert.equal(repository.users[0].passwordHash, legacyHash);

      const valid = await app.inject({
         method: "POST",
         url: "/api/auth/login",
         payload: { email: "legacy@example.com", password: PASSWORD },
      });
      assert.equal(valid.statusCode, 200);
      assert.match(repository.users[0].passwordHash, /^\$argon2id\$/);
   });
});

describe("access token authentication", () => {
   test("accepts a valid bearer token and does not require a database refresh session", async () => {
      const registration = await registerRequest(app);
      const accessToken = registration.json().data.accessToken as string;
      repository.sessions.length = 0;

      const response = await app.inject({
         method: "GET",
         url: "/api/auth/me",
         headers: { authorization: `Bearer ${accessToken}` },
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.json().data.user.email, "ada@example.com");
      assert.equal("passwordHash" in response.json().data.user, false);
   });

   test("returns generic unauthorized errors for missing and invalid tokens", async () => {
      const missing = await app.inject({ method: "GET", url: "/api/auth/me" });
      const invalid = await app.inject({
         method: "GET",
         url: "/api/auth/me",
         headers: { authorization: "Bearer not-a-jwt" },
      });

      assert.equal(missing.statusCode, 401);
      assert.equal(missing.json().error.code, "AUTH_UNAUTHORIZED");
      assert.equal(invalid.statusCode, 401);
      assert.equal(invalid.json().error.code, "AUTH_INVALID_ACCESS_TOKEN");
      assert.equal(invalid.json().error.message, "Authentication is invalid or has expired.");
   });

   test("rejects an expired access token", async () => {
      const registration = await registerRequest(app);
      const accessToken = registration.json().data.accessToken as string;
      now += (ACCESS_TTL_SECONDS + 1) * 1000;

      const response = await app.inject({
         method: "GET",
         url: "/api/auth/me",
         headers: { authorization: `Bearer ${accessToken}` },
      });
      assert.equal(response.statusCode, 401);
      assert.equal(response.json().error.code, "AUTH_INVALID_ACCESS_TOKEN");
   });
});

describe("authentication plugin scope", () => {
   test("exposes authenticate to sibling plugins without exposing auth routes globally", async () => {
      const scopedApp = await buildTestApp({}, {}, (server) => {
         server.register(async (domainServer) => {
            domainServer.get(
               "/sibling-protected",
               { preHandler: domainServer.authenticate },
               async (request) => ({ user: request.authUser }),
            );
         });
      });

      try {
         const registration = await registerRequest(scopedApp);
         const accessToken = registration.json().data.accessToken as string;
         const response = await scopedApp.inject({
            method: "GET",
            url: "/sibling-protected",
            headers: { authorization: `Bearer ${accessToken}` },
         });
         const outsidePrefix = await scopedApp.inject({ method: "GET", url: "/register" });

         assert.equal(response.statusCode, 200, response.body);
         assert.equal(response.json().user.email, "ada@example.com");
         assert.equal(outsidePrefix.statusCode, 404);
      } finally {
         await scopedApp.close();
      }
   });
});

describe("refresh rotation and replay detection", () => {
   test("rotates the opaque token, links sessions, and returns a new access token", async () => {
      const registration = await registerRequest(app);
      const firstCookie = cookieHeader(registration);
      const firstToken = cookieValue(registration);
      const response = await app.inject({
         method: "POST",
         url: "/api/auth/refresh",
         headers: { cookie: firstCookie },
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.json().success, true);
      assert.equal(typeof response.json().data.accessToken, "string");
      assert.equal("refreshToken" in response.json().data, false);
      const secondToken = cookieValue(response);
      assert.notEqual(secondToken, firstToken);
      assert.equal(repository.sessions.length, 2);
      assert.equal(repository.sessions[0].revokedAt?.getTime(), CLOCK_START);
      assert.equal(repository.sessions[0].replacedBySessionId, repository.sessions[1]._id);
      assert.equal(repository.sessions[1].familyId, repository.sessions[0].familyId);
      assert.equal(
         repository.sessions[1].refreshTokenHash,
         createHash("sha256").update(secondToken).digest("hex"),
      );
   });

   test("revokes the family and rejects reuse of a rotated token", async () => {
      const registration = await registerRequest(app);
      const firstCookie = cookieHeader(registration);
      const rotated = await app.inject({
         method: "POST",
         url: "/api/auth/refresh",
         headers: { cookie: firstCookie },
      });
      const secondCookie = cookieHeader(rotated);

      const replay = await app.inject({
         method: "POST",
         url: "/api/auth/refresh",
         headers: { cookie: firstCookie },
      });
      assert.equal(replay.statusCode, 401);
      assert.equal(replay.json().error.code, "AUTH_INVALID_REFRESH_TOKEN");
      assert.equal(repository.sessions[1].revokedAt?.getTime(), CLOCK_START);

      const activeAfterReplay = await app.inject({
         method: "POST",
         url: "/api/auth/refresh",
         headers: { cookie: secondCookie },
      });
      assert.equal(activeAfterReplay.statusCode, 401);
   });

   test("consumes a refresh token exactly once under concurrent requests", async () => {
      const registration = await registerRequest(app);
      const originalCookie = cookieHeader(registration);
      const originalSession = repository.sessions[0];
      const findSession = repository.findRefreshSessionByTokenHash.bind(repository);
      let readCount = 0;
      let releaseReads = () => {};
      const bothReads = new Promise<void>((resolve) => {
         releaseReads = resolve;
      });
      repository.findRefreshSessionByTokenHash = async (refreshTokenHash: string) => {
         const session = await findSession(refreshTokenHash);
         if (session && readCount < 2) {
            readCount += 1;
            if (readCount === 2) releaseReads();
            await bothReads;
         }
         return session;
      };

      const responses = await Promise.all([
         app.inject({
            method: "POST",
            url: "/api/auth/refresh",
            headers: { cookie: originalCookie },
         }),
         app.inject({
            method: "POST",
            url: "/api/auth/refresh",
            headers: { cookie: originalCookie },
         }),
      ]);
      const successful = responses.find((response) => response.statusCode === 200);
      const failed = responses.find((response) => response.statusCode !== 200);
      assert.ok(successful);
      assert.ok(failed);
      assert.equal(failed.statusCode, 401);
      assert.equal(failed.json().error.code, "AUTH_INVALID_REFRESH_TOKEN");
      assert.equal(failed.headers["set-cookie"], undefined);

      const replacement = repository.sessions.find(
         (session) => session._id !== originalSession._id,
      );
      assert.ok(replacement);
      assert.equal(repository.sessions.length, 2);
      assert.equal(repository.sessions.filter((session) => session.revokedAt === null).length, 1);
      assert.equal(replacement.revokedAt, null);
      assert.equal(originalSession.revokedAt?.getTime(), CLOCK_START);
      assert.equal(originalSession.replacedBySessionId, replacement._id);
      assert.equal(replacement.familyId, originalSession.familyId);

      const replacementCookie = cookieHeader(successful);
      const replay = await app.inject({
         method: "POST",
         url: "/api/auth/refresh",
         headers: { cookie: originalCookie },
      });
      assert.equal(replay.statusCode, 401);
      assert.equal(replay.json().error.code, "AUTH_INVALID_REFRESH_TOKEN");

      const usableAfterReplay = await app.inject({
         method: "POST",
         url: "/api/auth/refresh",
         headers: { cookie: replacementCookie },
      });
      assert.equal(usableAfterReplay.statusCode, 401);
      assert.ok(repository.sessions.every((session) => session.revokedAt !== null));
   });

   test("rejects an expired refresh session", async () => {
      const registration = await registerRequest(app);
      const refreshToken = cookieValue(registration);
      repository.sessions[0].expiresAt = new Date(CLOCK_START - 1);
      const response = await app.inject({
         method: "POST",
         url: "/api/auth/refresh",
         headers: { cookie: `${COOKIE_NAME}=${refreshToken}` },
      });
      assert.equal(response.statusCode, 401);
      assert.equal(response.json().error.code, "AUTH_INVALID_REFRESH_TOKEN");
   });
});

describe("logout", () => {
   test("revokes the refresh family, clears the cookie, and returns 204", async () => {
      const registration = await registerRequest(app);
      const cookie = cookieHeader(registration);
      const response = await app.inject({
         method: "POST",
         url: "/api/auth/logout",
         headers: { cookie },
      });

      assert.equal(response.statusCode, 204);
      assert.equal(response.body, "");
      assert.match(rawSetCookie(response), /Max-Age=0/);
      assert.ok(repository.sessions.every((session) => session.revokedAt !== null));

      const refreshAfterLogout = await app.inject({
         method: "POST",
         url: "/api/auth/refresh",
         headers: { cookie },
      });
      assert.equal(refreshAfterLogout.statusCode, 401);
   });
});

describe("origin and rate limiting", () => {
   test("adds credentialed CORS headers for a configured origin", async () => {
      const response = await registerRequest(app, registrationPayload(), {
         origin: ALLOWED_ORIGIN,
      });

      assert.equal(response.statusCode, 201, response.body);
      assert.equal(response.headers["access-control-allow-origin"], ALLOWED_ORIGIN);
      assert.equal(response.headers["access-control-allow-credentials"], "true");
      assert.notEqual(response.headers["access-control-allow-origin"], "*");
   });

   test("does not add CORS headers for a disallowed origin", async () => {
      const response = await registerRequest(app, registrationPayload(), {
         origin: "https://evil.example.test",
      });

      assert.equal(response.statusCode, 403);
      assert.equal(response.json().error.code, "AUTH_UNAUTHORIZED");
      assert.equal(response.headers["access-control-allow-origin"], undefined);
      assert.notEqual(response.headers["access-control-allow-origin"], "*");
   });

   test("answers an allowed preflight request with the required API permissions", async () => {
      const response = await app.inject({
         method: "OPTIONS",
         url: "/api/auth/refresh",
         headers: {
            origin: ALLOWED_ORIGIN,
            "access-control-request-method": "POST",
            "access-control-request-headers": "content-type",
         },
      });

      assert.equal(response.statusCode, 204, response.body);
      assert.equal(response.headers["access-control-allow-origin"], ALLOWED_ORIGIN);
      assert.match(String(response.headers["access-control-allow-methods"]), /POST/);
      assert.match(String(response.headers["access-control-allow-headers"]), /content-type/i);
   });

   test("supports credentialed GET responses without wildcard origin", async () => {
      const registration = await registerRequest(app);
      const response = await app.inject({
         method: "GET",
         url: "/api/auth/me",
         headers: {
            origin: ALLOWED_ORIGIN,
            authorization: `Bearer ${registration.json().data.accessToken}`,
         },
      });

      assert.equal(response.statusCode, 200, response.body);
      assert.equal(response.headers["access-control-allow-origin"], ALLOWED_ORIGIN);
      assert.equal(response.headers["access-control-allow-credentials"], "true");
      assert.notEqual(response.headers["access-control-allow-origin"], "*");
   });

   test("keeps requests without an Origin header valid", async () => {
      const response = await registerRequest(app);

      assert.equal(response.statusCode, 201, response.body);
   });

   test("rejects an unexpected browser origin on state-changing auth requests", async () => {
      const response = await registerRequest(app, registrationPayload(), {
         origin: "https://evil.example.test",
      });
      assert.equal(response.statusCode, 403);
      assert.equal(response.json().error.code, "AUTH_UNAUTHORIZED");
   });

   test("enforces configurable login limits without changing the error contract", async () => {
      const limited = await buildTestApp({}, { loginRateLimit: 2 });
      try {
         const first = await limited.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: { email: "nobody@example.com", password: PASSWORD },
         });
         const second = await limited.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: { email: "nobody@example.com", password: PASSWORD },
         });
         const third = await limited.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: { email: "nobody@example.com", password: PASSWORD },
         });
         assert.equal(first.statusCode, 401);
         assert.equal(second.statusCode, 401);
         assert.equal(third.statusCode, 429);
         assert.deepEqual(third.json(), {
            success: false,
            error: {
               code: "RATE_LIMITED",
               message: "Too many requests. Please try again later.",
            },
            requestId: third.json().requestId,
         });
      } finally {
         await limited.close();
      }
   });
});

describe("internal error handling", () => {
   test("does not expose implementation details", async () => {
      const failingRepository = new MemoryRepository();
      failingRepository.createUser = async () => {
         throw new Error("sensitive database detail");
      };
      const failing = await buildTestApp({ repository: failingRepository });
      try {
         const response = await registerRequest(failing);
         assert.equal(response.statusCode, 500);
         assert.equal(response.json().success, false);
         assert.equal(response.json().error.code, "INTERNAL_ERROR");
         assert.equal(response.json().error.message, "An unexpected error occurred.");
         assert.equal(response.body.includes("sensitive"), false);
      } finally {
         await failing.close();
      }
   });
});

describe("response and cookie contract", () => {
   test("does not expose passwords or hashes", async () => {
      const response = await registerRequest(app);
      assert.equal(response.body.includes("passwordHash"), false);
      assert.equal(response.body.includes(PASSWORD), false);
      assert.equal(response.body.includes("refreshToken"), false);
   });
});
