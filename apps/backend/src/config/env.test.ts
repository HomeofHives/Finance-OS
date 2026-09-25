import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { describe, test } from "node:test";

const keyPair = generateKeyPairSync("rsa", {
   modulusLength: 2048,
   publicKeyEncoding: { type: "spki", format: "pem" },
   privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const baseEnv: NodeJS.ProcessEnv = {
   NODE_ENV: "test",
   PORT: "5000",
   MONGODB_URI: "mongodb://localhost:27017/finance-os-test",
   JWT_ISSUER: "test-issuer",
   JWT_AUDIENCE: "test-audience",
   JWT_KEY_ID: "test-key",
   JWT_PRIVATE_KEY: keyPair.privateKey,
   JWT_PUBLIC_KEY: keyPair.publicKey,
};

Object.assign(process.env, baseEnv);
const { loadEnv } = await import("./env.js");

describe("environment configuration", () => {
   test("uses safe development defaults without a JWT secret", () => {
      const env = loadEnv({ ...baseEnv, NODE_ENV: "development" });

      assert.equal(env.AUTH_COOKIE_SECURE, false);
      assert.equal(env.REFRESH_COOKIE_NAME, "fos_refresh");
      assert.equal(env.AUTH_COOKIE_PATH, "/api/auth");
      assert.equal(env.AUTH_COOKIE_SAMESITE, "strict");
      assert.deepEqual(env.AUTH_ALLOWED_ORIGINS, ["http://localhost:5173"]);
   });

   test("requires HTTPS origins and uses a secure Host cookie in production", () => {
      const env = loadEnv({
         ...baseEnv,
         NODE_ENV: "production",
         AUTH_ALLOWED_ORIGINS: "https://app.example.test",
      });

      assert.equal(env.AUTH_COOKIE_SECURE, true);
      assert.equal(env.REFRESH_COOKIE_NAME, "__Host-fos_refresh");
      assert.equal(env.AUTH_COOKIE_PATH, "/");
      assert.throws(
         () =>
            loadEnv({
               ...baseEnv,
               NODE_ENV: "production",
               AUTH_ALLOWED_ORIGINS: "http://app.example.test",
            }),
         /HTTPS/,
      );
   });

   test("rejects missing signing keys and mismatched key pairs", () => {
      assert.throws(() => loadEnv({ ...baseEnv, JWT_PRIVATE_KEY: undefined }));
      const otherKeys = generateKeyPairSync("rsa", {
         modulusLength: 2048,
         publicKeyEncoding: { type: "spki", format: "pem" },
         privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });
      assert.throws(
         () => loadEnv({ ...baseEnv, JWT_PUBLIC_KEY: otherKeys.publicKey }),
         /do not match/,
      );
   });

   test("rejects origins with paths, credentials, or invalid schemes", () => {
      assert.throws(
         () => loadEnv({ ...baseEnv, AUTH_ALLOWED_ORIGINS: "https://app.example.test/private" }),
         /without paths/,
      );
      assert.throws(
         () => loadEnv({ ...baseEnv, AUTH_ALLOWED_ORIGINS: "https://user:pass@app.example.test" }),
         /without paths/,
      );
      assert.throws(
         () => loadEnv({ ...baseEnv, AUTH_ALLOWED_ORIGINS: "ftp://app.example.test" }),
         /without paths/,
      );
   });
});
