import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createApiErrorResponse } from "./api-response.js";
import { HttpError } from "./http-error.js";

export function registerErrorHandler(server: FastifyInstance) {
   server.setErrorHandler((error, request, reply) => {
      if (error instanceof HttpError) {
         return reply
            .status(error.statusCode)
            .send(createApiErrorResponse(error.code, error.message, { details: error.details }));
      }

      if (error instanceof z.ZodError) {
         return reply.status(400).send(
            createApiErrorResponse("VALIDATION_ERROR", "Invalid request payload.", {
               details: error.issues.map((issue) => ({
                  path: issue.path.join("."),
                  message: issue.message,
               })),
            }),
         );
      }

      const errorCode =
         typeof error === "object" && error !== null
            ? (error as { code?: unknown }).code
            : undefined;
      const statusCode =
         typeof error === "object" && error !== null
            ? (error as { statusCode?: unknown }).statusCode
            : undefined;
      if (statusCode === 429 || errorCode === "FST_ERR_RATE_LIMIT") {
         return reply.status(429).send(
            createApiErrorResponse("RATE_LIMITED", "Too many requests. Please try again later.", {
               requestId: request.id,
            }),
         );
      }
      if (typeof statusCode === "number" && statusCode >= 400 && statusCode < 500) {
         return reply.status(statusCode).send(
            createApiErrorResponse("BAD_REQUEST", "Request could not be processed.", {
               requestId: request.id,
            }),
         );
      }

      request.log.error({ err: error }, "Unhandled request error");
      return reply.status(500).send(
         createApiErrorResponse("INTERNAL_ERROR", "An unexpected error occurred.", {
            requestId: request.id,
         }),
      );
   });

   server.setNotFoundHandler((request, reply) => {
      reply.status(404).send(
         createApiErrorResponse("NOT_FOUND", "Route not found.", {
            requestId: request.id,
         }),
      );
   });
}
