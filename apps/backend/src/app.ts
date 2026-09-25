import "dotenv/config";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { authenticationPlugin } from "./plugins/authentication.plugin.js";
import { securityPlugin } from "./plugins/security.plugin.js";
import { authPlugin } from "./modules/auth/auth.plugin.js";
import { createApiSuccess } from "./shared/api-response.js";
import { registerErrorHandler } from "./shared/error-handler.js";

export const app = Fastify({
   logger: true,
});

registerErrorHandler(app);

app.get("/", async () => {
   return createApiSuccess({ message: "FinanceOS API running" });
});

app.register(securityPlugin, {
   allowedOrigins: env.AUTH_ALLOWED_ORIGINS,
   rateLimitWindowSeconds: env.AUTH_RATE_LIMIT_WINDOW_SECONDS,
});

app.register(authenticationPlugin, {
   issuer: env.JWT_ISSUER,
   audience: env.JWT_AUDIENCE,
   currentKeyId: env.JWT_KEY_ID,
   keys: {
      [env.JWT_KEY_ID]: {
         keyId: env.JWT_KEY_ID,
         privateKey: env.JWT_PRIVATE_KEY,
         publicKey: env.JWT_PUBLIC_KEY,
      },
   },
   accessTokenTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
   refreshTokenTtlSeconds: env.REFRESH_TOKEN_TTL_SECONDS,
   cookieName: env.REFRESH_COOKIE_NAME,
   cookiePath: env.AUTH_COOKIE_PATH,
   cookieSecure: env.AUTH_COOKIE_SECURE,
   cookieSameSite: env.AUTH_COOKIE_SAMESITE,
});

app.register(authPlugin, {
   prefix: "/api/auth",
   loginRateLimit: env.AUTH_LOGIN_RATE_LIMIT,
   registerRateLimit: env.AUTH_REGISTER_RATE_LIMIT,
   refreshRateLimit: env.AUTH_REFRESH_RATE_LIMIT,
   rateLimitWindowSeconds: env.AUTH_RATE_LIMIT_WINDOW_SECONDS,
});
