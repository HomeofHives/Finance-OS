import { randomUUID } from "node:crypto";
import {
   decodeProtectedHeader,
   importPKCS8,
   importSPKI,
   jwtVerify,
   SignJWT,
   type CryptoKey,
   type JWTPayload,
} from "jose";
import type { AccessTokenClaims, AccessTokenService } from "./auth.types.js";

const ALLOWED_ALGORITHM = "RS256" as const;
const REQUIRED_CLAIMS = ["iss", "aud", "sub", "jti", "iat", "exp"] as const;

export interface AccessTokenKeyConfig {
   keyId: string;
   privateKey?: string;
   publicKey: string;
}

export interface AccessTokenServiceOptions {
   issuer: string;
   audience: string;
   currentKeyId: string;
   keys: Record<string, AccessTokenKeyConfig>;
   accessTokenTtlSeconds: number;
   now?: () => number;
}

interface ImportedAccessTokenKey {
   privateKey?: CryptoKey;
   publicKey: CryptoKey;
}

function hasRequiredClaims(payload: JWTPayload): payload is JWTPayload & AccessTokenClaims {
   const hasValidAudience =
      typeof payload.aud === "string"
         ? payload.aud.length > 0
         : Array.isArray(payload.aud) &&
           payload.aud.length > 0 &&
           payload.aud.every((value) => typeof value === "string");
   return (
      typeof payload.iss === "string" &&
      payload.iss.length > 0 &&
      hasValidAudience &&
      typeof payload.sub === "string" &&
      payload.sub.length > 0 &&
      typeof payload.jti === "string" &&
      payload.jti.length > 0 &&
      typeof payload.iat === "number" &&
      Number.isFinite(payload.iat) &&
      typeof payload.exp === "number" &&
      Number.isFinite(payload.exp)
   );
}

export async function createAccessTokenService(
   options: AccessTokenServiceOptions,
): Promise<AccessTokenService> {
   const now = options.now ?? (() => Date.now());
   const importedKeys = new Map<string, ImportedAccessTokenKey>();

   for (const [keyId, key] of Object.entries(options.keys)) {
      const publicKey = await importSPKI(key.publicKey, ALLOWED_ALGORITHM);
      const privateKey = key.privateKey
         ? await importPKCS8(key.privateKey, ALLOWED_ALGORITHM)
         : undefined;
      importedKeys.set(keyId, { publicKey, privateKey });
   }

   const currentKey = importedKeys.get(options.currentKeyId);
   const signingKey = currentKey?.privateKey;
   if (!signingKey) {
      throw new Error("The current JWT signing key must include a private key.");
   }

   return {
      async signAccessToken(subject) {
         const issuedAt = Math.floor(now() / 1000);
         return new SignJWT({})
            .setProtectedHeader({
               alg: ALLOWED_ALGORITHM,
               kid: options.currentKeyId,
               typ: "JWT",
            })
            .setIssuer(options.issuer)
            .setAudience(options.audience)
            .setSubject(subject)
            .setJti(randomUUID())
            .setIssuedAt(issuedAt)
            .setExpirationTime(issuedAt + options.accessTokenTtlSeconds)
            .sign(signingKey);
      },

      async verifyAccessToken(token) {
         let header: ReturnType<typeof decodeProtectedHeader>;
         try {
            header = decodeProtectedHeader(token);
         } catch {
            return null;
         }

         if (
            header.alg !== ALLOWED_ALGORITHM ||
            header.typ !== "JWT" ||
            typeof header.kid !== "string"
         ) {
            return null;
         }

         const key = importedKeys.get(header.kid);
         if (!key) return null;

         try {
            const result = await jwtVerify(token, key.publicKey, {
               algorithms: [ALLOWED_ALGORITHM],
               issuer: options.issuer,
               audience: options.audience,
               typ: "JWT",
               requiredClaims: [...REQUIRED_CLAIMS],
               currentDate: new Date(now()),
            });
            const payload = result.payload;
            if (!hasRequiredClaims(payload)) return null;
            if (payload.exp <= payload.iat || payload.iat > Math.floor(now() / 1000) + 60)
               return null;
            return {
               iss: payload.iss,
               aud: payload.aud,
               sub: payload.sub,
               jti: payload.jti,
               iat: payload.iat,
               exp: payload.exp,
            };
         } catch {
            return null;
         }
      },
   };
}

export function extractBearerToken(header: string | undefined): string | undefined {
   if (!header) return undefined;
   const match = /^Bearer\s+([^\s]+)$/i.exec(header.trim());
   return match?.[1];
}
