import type { FastifyReply, FastifyRequest } from "fastify";
import { createApiSuccess } from "../../shared/api-response.js";
import { HttpError } from "../../shared/http-error.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import type { AuthCookieConfig, AuthService } from "./auth.types.js";

export interface AuthControllerOptions {
   service: AuthService;
   cookies: AuthCookieConfig;
}

export interface AuthController {
   register: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>;
   login: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>;
   refresh: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>;
   me: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>;
   logout: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>;
}

export function createAuthController(options: AuthControllerOptions): AuthController {
   const { service, cookies } = options;

   const setRefreshCookie = (reply: FastifyReply, refreshToken: string) => {
      reply.setCookie(cookies.name, refreshToken, {
         httpOnly: true,
         secure: cookies.secure,
         sameSite: cookies.sameSite,
         path: cookies.path,
         maxAge: cookies.maxAgeSeconds,
         expires: new Date(Date.now() + cookies.maxAgeSeconds * 1000),
      });
   };

   const clearRefreshCookie = (reply: FastifyReply) => {
      reply.clearCookie(cookies.name, {
         httpOnly: true,
         secure: cookies.secure,
         sameSite: cookies.sameSite,
         path: cookies.path,
      });
   };

   return {
      async register(request, reply) {
         const input = registerSchema.parse(request.body);
         const result = await service.register(input, { requestId: request.id });
         setRefreshCookie(reply, result.refreshToken);
         return reply
            .status(201)
            .send(createApiSuccess({ user: result.user, accessToken: result.accessToken }));
      },

      async login(request, reply) {
         const input = loginSchema.parse(request.body);
         const result = await service.login(input, { requestId: request.id });
         setRefreshCookie(reply, result.refreshToken);
         return reply.send(
            createApiSuccess({ user: result.user, accessToken: result.accessToken }),
         );
      },

      async refresh(request, reply) {
         const result = await service.refresh(request.cookies[cookies.name], {
            requestId: request.id,
         });
         setRefreshCookie(reply, result.refreshToken);
         return reply.send(createApiSuccess({ accessToken: result.accessToken }));
      },

      async me(request, reply) {
         if (!request.authUser) {
            throw new HttpError(401, "AUTH_UNAUTHORIZED", "Authentication required.");
         }
         return reply.send(createApiSuccess({ user: request.authUser }));
      },

      async logout(request, reply) {
         await service.logout(request.cookies[cookies.name], { requestId: request.id });
         clearRefreshCookie(reply);
         return reply.status(204).send();
      },
   };
}
