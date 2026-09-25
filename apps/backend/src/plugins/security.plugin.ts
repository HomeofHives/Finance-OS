import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { HttpError } from "../shared/http-error.js";

export interface SecurityPluginOptions {
   allowedOrigins: string[];
   rateLimitWindowSeconds: number;
}

function isAuthStateChangingRequest(url: string, method: string): boolean {
   return method === "POST" && url.split("?", 1)[0].startsWith("/api/auth/");
}

const securityPluginImplementation: FastifyPluginAsync<SecurityPluginOptions> = async (
   server,
   options,
) => {
   await server.register(cors, {
      origin: options.allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
      strictPreflight: true,
   });

   await server.register(rateLimit, {
      global: false,
      keyGenerator: (request) => request.ip,
   });

   server.addHook("onRequest", async (request) => {
      if (!isAuthStateChangingRequest(request.url, request.method)) return;
      const origin = request.headers.origin;
      if (origin === undefined) return;
      if (typeof origin !== "string" || !options.allowedOrigins.includes(origin)) {
         throw new HttpError(403, "AUTH_UNAUTHORIZED", "Request origin is not allowed.");
      }
   });

   server.log.debug(
      { rateLimitWindowSeconds: options.rateLimitWindowSeconds },
      "Security hooks registered",
   );
};

export const securityPlugin = fastifyPlugin(securityPluginImplementation, {
   name: "security",
});
