import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { AuthController } from "./auth.controller.js";

export interface AuthRateLimitConfig {
   max: number;
   timeWindow: string;
}

export interface RegisterAuthRoutesOptions {
   controller: AuthController;
   authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
   rateLimits: {
      register: AuthRateLimitConfig;
      refresh: AuthRateLimitConfig;
      login: AuthRateLimitConfig;
   };
}

export function registerAuthRoutes(
   server: FastifyInstance,
   options: RegisterAuthRoutesOptions,
): void {
   const { controller, authenticate, rateLimits } = options;

   server.post("/register", { config: { rateLimit: rateLimits.register } }, controller.register);
   server.post("/login", { config: { rateLimit: rateLimits.login } }, controller.login);
   server.post("/refresh", { config: { rateLimit: rateLimits.refresh } }, controller.refresh);
   server.get("/me", { preHandler: authenticate }, controller.me);
   server.post("/logout", controller.logout);
}
