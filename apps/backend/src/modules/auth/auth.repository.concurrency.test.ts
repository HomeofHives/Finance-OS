import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import type { OutgoingHttpHeaders } from "node:http";
import { test } from "node:test";
import Fastify, { type FastifyInstance } from "fastify";
import mongoose from "mongoose";
import { createAuthRepository } from "./auth.repository.js";
import { AuthSessionModel, AuthUserModel } from "./auth.model.js";
import { authPlugin } from "./auth.plugin.js";
import type {
   AuthRepository,
   AuthSessionInput,
   AuthUserInput,
   RefreshSessionRecord,
   RotateRefreshSessionInput,
   UserRecord,
} from "./auth.types.js";
import { authenticationPlugin } from "../../plugins/authentication.plugin.js";
import { securityPlugin } from "../../plugins/security.plugin.js";
import { registerErrorHandler } from "../../shared/error-handler.js";

const keyPair = generateKeyPairSync("rsa", {
   modulusLength: 2048,
   publicKeyEncoding: { type: "spki", format: "pem" },
   privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

class BarrierRepository implements AuthRepository {
   private readCount = 0;
   private releaseReads = () => {};
   private readonly bothReads = new Promise<void>((resolve) => {
      this.releaseReads = resolve;
   });

   constructor(private readonly repository: AuthRepository) {}

   async findUserByEmail(email: string): Promise<UserRecord | null> {
      return this.repository.findUserByEmail(email);
   }

   async findUserById(id: string): Promise<UserRecord | null> {
      return this.repository.findUserById(id);
   }

   async createUser(input: AuthUserInput): Promise<UserRecord> {
      return this.repository.createUser(input);
   }

   async updateUserPasswordHash(userId: string, passwordHash: string): Promise<void> {
      return this.repository.updateUserPasswordHash(userId, passwordHash);
   }

   async createRefreshSession(input: AuthSessionInput): Promise<RefreshSessionRecord> {
      return this.repository.createRefreshSession(input);
   }

   async findRefreshSessionByTokenHash(
      refreshTokenHash: string,
   ): Promise<RefreshSessionRecord | null> {
      const session = await this.repository.findRefreshSessionByTokenHash(refreshTokenHash);
      if (session && this.readCount < 2) {
         this.readCount += 1;
         if (this.readCount === 2) this.releaseReads();
         await this.bothReads;
      }
      return session;
   }

   async rotateRefreshSession(
      input: RotateRefreshSessionInput,
   ): Promise<RefreshSessionRecord | null> {
      return this.repository.rotateRefreshSession(input);
   }

   async revokeRefreshFamily(familyId: string, revokedAt: Date): Promise<void> {
      return this.repository.revokeRefreshFamily(familyId, revokedAt);
   }
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

async function buildApp(repository: AuthRepository): Promise<FastifyInstance> {
   const server = Fastify({ logger: false });
   registerErrorHandler(server);
   server.register(securityPlugin, {
      allowedOrigins: ["https://app.example.test"],
      rateLimitWindowSeconds: 60,
   });
   server.register(authenticationPlugin, {
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
      accessTokenTtlSeconds: 600,
      refreshTokenTtlSeconds: 3600,
      cookieName: "fos_refresh",
      cookiePath: "/api/auth",
      cookieSecure: false,
      cookieSameSite: "strict",
   });
   server.register(authPlugin, {
      prefix: "/api/auth",
      loginRateLimit: 100,
      registerRateLimit: 100,
      refreshRateLimit: 100,
      rateLimitWindowSeconds: 60,
   });
   await server.ready();
   return server;
}

test("real repository consumes one concurrent refresh session", async (t) => {
   const uri =
      process.env.MONGODB_TEST_URI ??
      "mongodb://127.0.0.1:27017/finance-os-refresh-concurrency-test";
   const wasConnected = mongoose.connection.readyState === 1;
   try {
      await mongoose.connect(uri, {
         serverSelectionTimeoutMS: 1000,
         connectTimeoutMS: 1000,
      });
   } catch {
      t.skip("MongoDB test server is unavailable");
      return;
   }

   let server: FastifyInstance | undefined;
   try {
      await AuthUserModel.deleteMany({});
      await AuthSessionModel.deleteMany({});
      server = await buildApp(new BarrierRepository(createAuthRepository()));
      const registration = await server.inject({
         method: "POST",
         url: "/api/auth/register",
         payload: {
            name: "Concurrent User",
            email: "concurrent@example.com",
            password: "supersecret123",
         },
      });
      assert.equal(registration.statusCode, 201, registration.body);
      const originalCookie = cookieHeader(registration);
      const originalToken = cookieValue(registration);
      const userId = registration.json().data.user.id as string;
      const original = await AuthSessionModel.findOne({ userId });
      assert.ok(original);

      const responses = await Promise.all([
         server.inject({
            method: "POST",
            url: "/api/auth/refresh",
            headers: { cookie: `fos_refresh=${originalToken}` },
         }),
         server.inject({
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

      const sessions = await AuthSessionModel.find({ familyId: original.familyId }).sort({
         createdAt: 1,
      });
      const oldSession = sessions.find(
         (session) => session._id.toString() === original._id.toString(),
      );
      const replacement = sessions.find(
         (session) => session._id.toString() !== original._id.toString(),
      );
      assert.ok(oldSession);
      assert.ok(replacement);
      assert.equal(sessions.length, 2);
      assert.equal(sessions.filter((session) => session.revokedAt === null).length, 1);
      assert.equal(replacement.revokedAt, null);
      assert.equal(oldSession.replacedBySessionId?.toString(), replacement._id.toString());
      assert.equal(replacement.familyId, original.familyId);
      assert.equal(replacement.refreshTokenHash !== original.refreshTokenHash, true);

      const replay = await server.inject({
         method: "POST",
         url: "/api/auth/refresh",
         headers: { cookie: originalCookie },
      });
      assert.equal(replay.statusCode, 401);
      assert.equal(replay.json().error.code, "AUTH_INVALID_REFRESH_TOKEN");

      const replacementCookie = cookieHeader(successful);
      const usableAfterReplay = await server.inject({
         method: "POST",
         url: "/api/auth/refresh",
         headers: { cookie: replacementCookie },
      });
      assert.equal(usableAfterReplay.statusCode, 401);
      const revokedSessions = await AuthSessionModel.find({ familyId: original.familyId });
      assert.ok(revokedSessions.every((session) => session.revokedAt !== null));
   } finally {
      if (server) await server.close();
      if (!wasConnected && mongoose.connection.readyState !== 0) await mongoose.disconnect();
   }
});
