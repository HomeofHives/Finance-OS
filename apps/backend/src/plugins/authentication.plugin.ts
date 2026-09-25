import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import cookie from "@fastify/cookie";
import { createAuthRepository } from "../modules/auth/auth.repository.js";
import { createAuthService } from "../modules/auth/auth.service.js";
import {
   createAccessTokenService,
   extractBearerToken,
   type AccessTokenKeyConfig,
} from "../modules/auth/token.service.js";
import type {
   AuthCookieConfig,
   AuthRepository,
   AuthService,
   SafeUser,
} from "../modules/auth/auth.types.js";

export interface AuthenticationPluginOptions {
   repository?: AuthRepository;
   issuer: string;
   audience: string;
   currentKeyId: string;
   keys: Record<string, AccessTokenKeyConfig>;
   accessTokenTtlSeconds: number;
   refreshTokenTtlSeconds: number;
   cookieName: string;
   cookiePath: string;
   cookieSecure: boolean;
   cookieSameSite: AuthCookieConfig["sameSite"];
   now?: () => number;
}

const authenticationPluginImplementation: FastifyPluginAsync<AuthenticationPluginOptions> = async (
   server,
   options,
) => {
   await server.register(cookie);

   if (options.cookieName.startsWith("__Host-") && options.cookiePath !== "/") {
      throw new Error("__Host- refresh cookies require Path=/.");
   }
   if (options.cookieName.startsWith("__Host-") && !options.cookieSecure) {
      throw new Error("__Host- refresh cookies require Secure.");
   }

   const repository = options.repository ?? createAuthRepository();
   const tokenService = await createAccessTokenService({
      issuer: options.issuer,
      audience: options.audience,
      currentKeyId: options.currentKeyId,
      keys: options.keys,
      accessTokenTtlSeconds: options.accessTokenTtlSeconds,
      now: options.now,
   });
   const service = createAuthService({
      repository,
      tokenService,
      refreshTokenTtlSeconds: options.refreshTokenTtlSeconds,
      now: options.now,
      logger: server.log,
   });
   const cookieConfig: AuthCookieConfig = {
      name: options.cookieName,
      path: options.cookiePath,
      secure: options.cookieSecure,
      sameSite: options.cookieSameSite,
      maxAgeSeconds: options.refreshTokenTtlSeconds,
   };

   server.decorate("authService", service);
   server.decorate("authCookieConfig", cookieConfig);
   server.decorate("authenticate", async (request) => {
      const accessToken = extractBearerToken(request.headers.authorization);
      request.authUser = await service.authenticateAccessToken(accessToken, {
         requestId: request.id,
      });
   });
};

export const authenticationPlugin = fastifyPlugin(authenticationPluginImplementation, {
   name: "authentication",
});

declare module "fastify" {
   interface FastifyRequest {
      authUser?: SafeUser;
   }

   interface FastifyInstance {
      authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
      authService: AuthService;
      authCookieConfig: AuthCookieConfig;
   }
}
