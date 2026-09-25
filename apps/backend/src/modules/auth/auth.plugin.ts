import type { FastifyPluginAsync } from "fastify";
import { createAuthController } from "./auth.controller.js";
import { registerAuthRoutes } from "./auth.routes.js";

export interface AuthPluginOptions {
   loginRateLimit: number;
   registerRateLimit: number;
   refreshRateLimit: number;
   rateLimitWindowSeconds: number;
}

export const authPlugin: FastifyPluginAsync<AuthPluginOptions> = async (server, options) => {
   if (!server.authService || !server.authCookieConfig || !server.authenticate) {
      throw new Error("Authentication plugin must be registered before the auth route plugin.");
   }

   const controller = createAuthController({
      service: server.authService,
      cookies: server.authCookieConfig,
   });

   registerAuthRoutes(server, {
      controller,
      authenticate: server.authenticate,
      rateLimits: {
         register: {
            max: options.registerRateLimit,
            timeWindow: `${options.rateLimitWindowSeconds} seconds`,
         },
         login: {
            max: options.loginRateLimit,
            timeWindow: `${options.rateLimitWindowSeconds} seconds`,
         },
         refresh: {
            max: options.refreshRateLimit,
            timeWindow: `${options.rateLimitWindowSeconds} seconds`,
         },
      },
   });
};
