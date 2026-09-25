import { createPrivateKey, createPublicKey, type KeyObject } from "node:crypto";
import { z } from "zod";

const positiveInteger = z.coerce.number().int().positive();

const envSchema = z.object({
   NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
   PORT: z.coerce.number().int().min(1).max(65535).default(5000),
   MONGODB_URI: z.string().min(1),

   JWT_ISSUER: z.string().min(1),
   JWT_AUDIENCE: z.string().min(1),
   JWT_KEY_ID: z.string().min(1),
   JWT_PRIVATE_KEY: z.string().min(1).transform(normalizePem),
   JWT_PUBLIC_KEY: z.string().min(1).transform(normalizePem),
   ACCESS_TOKEN_TTL_SECONDS: positiveInteger.default(600),

   REFRESH_TOKEN_TTL_SECONDS: positiveInteger.default(60 * 60 * 24 * 30),
   REFRESH_COOKIE_NAME: z.string().min(1).optional(),

   AUTH_LOGIN_RATE_LIMIT: positiveInteger.default(5),
   AUTH_REGISTER_RATE_LIMIT: positiveInteger.default(3),
   AUTH_REFRESH_RATE_LIMIT: positiveInteger.default(10),
   AUTH_RATE_LIMIT_WINDOW_SECONDS: positiveInteger.default(60),
   AUTH_ALLOWED_ORIGINS: z.string().optional(),
});

function normalizePem(value: string): string {
   return value.replace(/\r\n?/g, "\n").replace(/\\n/g, "\n").trim();
}

function normalizeOrigin(value: string): string {
   let parsed: URL;
   try {
      parsed = new URL(value);
   } catch {
      throw new Error("AUTH_ALLOWED_ORIGINS must contain valid origin URLs.");
   }
   if (
      (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
      parsed.pathname !== "/" ||
      parsed.search !== "" ||
      parsed.hash !== "" ||
      parsed.username ||
      parsed.password
   ) {
      throw new Error(
         "AUTH_ALLOWED_ORIGINS must contain origin URLs without paths or credentials.",
      );
   }
   return parsed.origin;
}

function parseAllowedOrigins(value: string): string[] {
   return [
      ...new Set(
         value
            .split(",")
            .map((origin) => origin.trim())
            .filter(Boolean)
            .map(normalizeOrigin),
      ),
   ];
}

function validateKeyConfiguration(parsed: z.infer<typeof envSchema>): void {
   let privateKey: KeyObject;
   let publicKey: KeyObject;
   try {
      privateKey = createPrivateKey(parsed.JWT_PRIVATE_KEY);
      publicKey = createPublicKey(parsed.JWT_PUBLIC_KEY);
   } catch {
      throw new Error("JWT signing configuration contains an invalid PEM key.");
   }

   if (privateKey.asymmetricKeyType !== "rsa" || publicKey.asymmetricKeyType !== "rsa") {
      throw new Error("JWT signing configuration must use RSA keys.");
   }

   let derivedPublicKey: string;
   try {
      derivedPublicKey = createPublicKey(privateKey)
         .export({ format: "pem", type: "spki" })
         .toString();
   } catch {
      throw new Error("JWT private key cannot derive an RSA public key.");
   }
   if (derivedPublicKey.trim() !== parsed.JWT_PUBLIC_KEY.trim()) {
      throw new Error("JWT private and public keys do not match.");
   }
}

export interface AppEnv {
   NODE_ENV: "development" | "production" | "test";
   PORT: number;
   MONGODB_URI: string;
   JWT_ISSUER: string;
   JWT_AUDIENCE: string;
   JWT_KEY_ID: string;
   JWT_PRIVATE_KEY: string;
   JWT_PUBLIC_KEY: string;
   ACCESS_TOKEN_TTL_SECONDS: number;
   REFRESH_TOKEN_TTL_SECONDS: number;
   REFRESH_COOKIE_NAME: string;
   AUTH_COOKIE_PATH: string;
   AUTH_COOKIE_SECURE: boolean;
   AUTH_COOKIE_SAMESITE: "strict";
   AUTH_LOGIN_RATE_LIMIT: number;
   AUTH_REGISTER_RATE_LIMIT: number;
   AUTH_REFRESH_RATE_LIMIT: number;
   AUTH_RATE_LIMIT_WINDOW_SECONDS: number;
   AUTH_ALLOWED_ORIGINS: string[];
}

export function loadEnv(input: NodeJS.ProcessEnv = process.env): AppEnv {
   const parsed = envSchema.parse(input);
   const allowedOriginsInput =
      parsed.AUTH_ALLOWED_ORIGINS ??
      (parsed.NODE_ENV === "production" ? "" : "http://localhost:5173");
   if (parsed.NODE_ENV === "production" && !allowedOriginsInput.trim()) {
      throw new Error("AUTH_ALLOWED_ORIGINS is required in production.");
   }
   validateKeyConfiguration(parsed);

   const cookieName =
      parsed.REFRESH_COOKIE_NAME ??
      (parsed.NODE_ENV === "production" ? "__Host-fos_refresh" : "fos_refresh");
   if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(cookieName)) {
      throw new Error("REFRESH_COOKIE_NAME contains invalid characters.");
   }
   if (cookieName.startsWith("__Host-") && cookieName.length <= 7) {
      throw new Error("REFRESH_COOKIE_NAME is invalid.");
   }

   const allowedOrigins = parseAllowedOrigins(allowedOriginsInput);
   if (
      parsed.NODE_ENV === "production" &&
      allowedOrigins.some((origin) => !origin.startsWith("https://"))
   ) {
      throw new Error("AUTH_ALLOWED_ORIGINS must use HTTPS in production.");
   }

   return {
      NODE_ENV: parsed.NODE_ENV,
      PORT: parsed.PORT,
      MONGODB_URI: parsed.MONGODB_URI,
      JWT_ISSUER: parsed.JWT_ISSUER,
      JWT_AUDIENCE: parsed.JWT_AUDIENCE,
      JWT_KEY_ID: parsed.JWT_KEY_ID,
      JWT_PRIVATE_KEY: parsed.JWT_PRIVATE_KEY,
      JWT_PUBLIC_KEY: parsed.JWT_PUBLIC_KEY,
      ACCESS_TOKEN_TTL_SECONDS: parsed.ACCESS_TOKEN_TTL_SECONDS,
      REFRESH_TOKEN_TTL_SECONDS: parsed.REFRESH_TOKEN_TTL_SECONDS,
      REFRESH_COOKIE_NAME: cookieName,
      AUTH_COOKIE_PATH: cookieName.startsWith("__Host-") ? "/" : "/api/auth",
      AUTH_COOKIE_SECURE: parsed.NODE_ENV === "production",
      AUTH_COOKIE_SAMESITE: "strict",
      AUTH_LOGIN_RATE_LIMIT: parsed.AUTH_LOGIN_RATE_LIMIT,
      AUTH_REGISTER_RATE_LIMIT: parsed.AUTH_REGISTER_RATE_LIMIT,
      AUTH_REFRESH_RATE_LIMIT: parsed.AUTH_REFRESH_RATE_LIMIT,
      AUTH_RATE_LIMIT_WINDOW_SECONDS: parsed.AUTH_RATE_LIMIT_WINDOW_SECONDS,
      AUTH_ALLOWED_ORIGINS: allowedOrigins,
   };
}

export const env = loadEnv();
