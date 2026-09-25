import assert from "node:assert/strict";
import { generateKeyPairSync, randomBytes } from "node:crypto";
import { describe, test } from "node:test";
import { SignJWT, decodeProtectedHeader, importPKCS8 } from "jose";
import {
   createAccessTokenService,
   extractBearerToken,
   type AccessTokenKeyConfig,
} from "./token.service.js";

const ISSUER = "test-issuer";
const AUDIENCE = "test-audience";
const CLOCK_START = Date.parse("2026-01-01T00:00:00.000Z");

function createKeyPair() {
   return generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
   });
}

const primaryKeys = createKeyPair();
const secondaryKeys = createKeyPair();

function serviceOptions(
   keys: Record<string, AccessTokenKeyConfig>,
   currentKeyId: string,
   now: () => number,
) {
   return {
      issuer: ISSUER,
      audience: AUDIENCE,
      currentKeyId,
      keys,
      accessTokenTtlSeconds: 600,
      now,
   };
}

describe("access token service", () => {
   test("signs and verifies RS256 access tokens with required claims", async () => {
      let now = CLOCK_START;
      const service = await createAccessTokenService(
         serviceOptions(
            {
               current: {
                  keyId: "current",
                  privateKey: primaryKeys.privateKey,
                  publicKey: primaryKeys.publicKey,
               },
            },
            "current",
            () => now,
         ),
      );

      const token = await service.signAccessToken("user-1");
      const header = decodeProtectedHeader(token);
      const claims = await service.verifyAccessToken(token);

      assert.equal(header.alg, "RS256");
      assert.equal(header.typ, "JWT");
      assert.equal(header.kid, "current");
      assert.ok(claims);
      assert.equal(claims.iss, ISSUER);
      assert.equal(claims.aud, AUDIENCE);
      assert.equal(claims.sub, "user-1");
      assert.equal(typeof claims.jti, "string");
      assert.equal(claims.iat, Math.floor(now / 1000));
      assert.equal(claims.exp, Math.floor(now / 1000) + 600);
      now += 601_000;
      assert.equal(await service.verifyAccessToken(token), null);
   });

   test("rejects wrong issuer and audience", async () => {
      const primaryService = await createAccessTokenService(
         serviceOptions(
            {
               current: {
                  keyId: "current",
                  privateKey: primaryKeys.privateKey,
                  publicKey: primaryKeys.publicKey,
               },
            },
            "current",
            () => CLOCK_START,
         ),
      );
      const wrongIssuerService = await createAccessTokenService({
         ...serviceOptions(
            {
               current: {
                  keyId: "current",
                  privateKey: primaryKeys.privateKey,
                  publicKey: primaryKeys.publicKey,
               },
            },
            "current",
            () => CLOCK_START,
         ),
         issuer: "different-issuer",
      });
      const wrongAudienceService = await createAccessTokenService({
         ...serviceOptions(
            {
               current: {
                  keyId: "current",
                  privateKey: primaryKeys.privateKey,
                  publicKey: primaryKeys.publicKey,
               },
            },
            "current",
            () => CLOCK_START,
         ),
         audience: "different-audience",
      });

      const token = await primaryService.signAccessToken("user-1");
      assert.equal(await wrongIssuerService.verifyAccessToken(token), null);
      assert.equal(await wrongAudienceService.verifyAccessToken(token), null);
   });

   test("rejects invalid signatures and algorithms", async () => {
      let now = CLOCK_START;
      const service = await createAccessTokenService(
         serviceOptions(
            {
               current: {
                  keyId: "current",
                  privateKey: primaryKeys.privateKey,
                  publicKey: primaryKeys.publicKey,
               },
            },
            "current",
            () => now,
         ),
      );
      const foreignService = await createAccessTokenService(
         serviceOptions(
            {
               current: {
                  keyId: "current",
                  privateKey: secondaryKeys.privateKey,
                  publicKey: secondaryKeys.publicKey,
               },
            },
            "current",
            () => now,
         ),
      );
      const foreignToken = await foreignService.signAccessToken("user-1");
      assert.equal(await service.verifyAccessToken(foreignToken), null);

      const secret = randomBytes(32);
      const hsToken = await new SignJWT({ sub: "user-1" })
         .setProtectedHeader({ alg: "HS256", kid: "current", typ: "JWT" })
         .setIssuer(ISSUER)
         .setAudience(AUDIENCE)
         .setIssuedAt(Math.floor(now / 1000))
         .setExpirationTime(Math.floor(now / 1000) + 600)
         .sign(secret);
      assert.equal(await service.verifyAccessToken(hsToken), null);
   });

   test("rejects missing claims and unknown key IDs", async () => {
      const privateKey = await importPKCS8(primaryKeys.privateKey, "RS256");
      const service = await createAccessTokenService(
         serviceOptions(
            {
               current: {
                  keyId: "current",
                  privateKey: primaryKeys.privateKey,
                  publicKey: primaryKeys.publicKey,
               },
            },
            "current",
            () => CLOCK_START,
         ),
      );
      const missingClaims = await new SignJWT({})
         .setProtectedHeader({ alg: "RS256", kid: "current", typ: "JWT" })
         .sign(privateKey);
      assert.equal(await service.verifyAccessToken(missingClaims), null);

      const unknownKey = await new SignJWT({})
         .setProtectedHeader({ alg: "RS256", kid: "unknown", typ: "JWT" })
         .setIssuer(ISSUER)
         .setAudience(AUDIENCE)
         .setSubject("user-1")
         .setJti("jti-1")
         .setIssuedAt(Math.floor(CLOCK_START / 1000))
         .setExpirationTime(Math.floor(CLOCK_START / 1000) + 600)
         .sign(privateKey);
      assert.equal(await service.verifyAccessToken(unknownKey), null);
   });

   test("selects verification keys by kid for rotation", async () => {
      const service = await createAccessTokenService(
         serviceOptions(
            {
               previous: {
                  keyId: "previous",
                  publicKey: secondaryKeys.publicKey,
               },
               current: {
                  keyId: "current",
                  privateKey: primaryKeys.privateKey,
                  publicKey: primaryKeys.publicKey,
               },
            },
            "current",
            () => CLOCK_START,
         ),
      );
      const previousPrivateKey = await importPKCS8(secondaryKeys.privateKey, "RS256");
      const previousToken = await new SignJWT({})
         .setProtectedHeader({ alg: "RS256", kid: "previous", typ: "JWT" })
         .setIssuer(ISSUER)
         .setAudience(AUDIENCE)
         .setSubject("user-1")
         .setJti("jti-previous")
         .setIssuedAt(Math.floor(CLOCK_START / 1000))
         .setExpirationTime(Math.floor(CLOCK_START / 1000) + 600)
         .sign(previousPrivateKey);
      assert.equal((await service.verifyAccessToken(previousToken))?.sub, "user-1");
   });
});

describe("bearer token extraction", () => {
   test("accepts one bearer value and rejects other schemes", () => {
      assert.equal(extractBearerToken("Bearer abc.def.ghi"), "abc.def.ghi");
      assert.equal(extractBearerToken("bearer abc.def.ghi"), "abc.def.ghi");
      assert.equal(extractBearerToken("Basic abc"), undefined);
      assert.equal(extractBearerToken("Bearer one Bearer two"), undefined);
      assert.equal(extractBearerToken(undefined), undefined);
   });
});
