import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import { HttpError } from "../../shared/http-error.js";
import { isLegacyScryptHash, hashPassword, verifyPassword } from "./password.service.js";
import type {
   AccessTokenService,
   AuthLogContext,
   AuthRepository,
   AuthResult,
   AuthService,
   LoginInput,
   RefreshResult,
   RegisterInput,
   SafeUser,
   UserRecord,
} from "./auth.types.js";
import { DuplicateUserError } from "./auth.types.js";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
const INVALID_ACCESS_TOKEN_MESSAGE = "Authentication is invalid or has expired.";
const INVALID_REFRESH_TOKEN_MESSAGE = "Refresh authentication is invalid or has expired.";
const REFRESH_REPLAY_SECURITY_CODE = "AUTH_REFRESH_REPLAY";

export interface AuthServiceOptions {
   repository: AuthRepository;
   tokenService: AccessTokenService;
   refreshTokenTtlSeconds: number;
   now?: () => number;
   logger?: Pick<FastifyBaseLogger, "info" | "warn" | "error">;
}

export function createAuthService(options: AuthServiceOptions): AuthService {
   const nowMs = options.now ?? (() => Date.now());
   const logger = options.logger;
   let dummyHashPromise: Promise<string> | undefined;

   const invalidAccessToken = () =>
      new HttpError(401, "AUTH_INVALID_ACCESS_TOKEN", INVALID_ACCESS_TOKEN_MESSAGE);
   const invalidRefreshToken = () =>
      new HttpError(401, "AUTH_INVALID_REFRESH_TOKEN", INVALID_REFRESH_TOKEN_MESSAGE);

   const log = (
      level: "info" | "warn" | "error",
      event: string,
      context: AuthLogContext,
      details: Record<string, unknown> = {},
   ) => {
      logger?.[level](
         {
            event,
            requestId: context.requestId,
            ...details,
         },
         event,
      );
   };

   const getDummyHash = () => {
      dummyHashPromise ??= hashPassword(randomBytes(32).toString("hex"));
      return dummyHashPromise;
   };

   const establishSession = async (userId: string) => {
      const refreshToken = randomBytes(32).toString("base64url");
      const now = new Date(nowMs());
      const expiresAt = new Date(now.getTime() + options.refreshTokenTtlSeconds * 1000);
      await options.repository.createRefreshSession({
         userId,
         refreshTokenHash: hashRefreshToken(refreshToken),
         familyId: randomUUID(),
         expiresAt,
         lastUsedAt: now,
      });
      return refreshToken;
   };

   const migrateLegacyPasswordIfNeeded = async (user: UserRecord, password: string) => {
      if (!isLegacyScryptHash(user.passwordHash)) return;
      const passwordHash = await hashPassword(password);
      await options.repository.updateUserPasswordHash(user._id, passwordHash);
   };

   return {
      async register(input: RegisterInput, context: AuthLogContext = {}): Promise<AuthResult> {
         const existing = await options.repository.findUserByEmail(input.email);
         if (existing) {
            throw new HttpError(
               409,
               "USER_ALREADY_EXISTS",
               "A user with this email already exists.",
            );
         }

         const passwordHash = await hashPassword(input.password);
         let user: UserRecord;
         try {
            user = await options.repository.createUser({
               name: input.name,
               email: input.email,
               passwordHash,
            });
         } catch (error) {
            if (error instanceof DuplicateUserError) {
               throw new HttpError(
                  409,
                  "USER_ALREADY_EXISTS",
                  "A user with this email already exists.",
               );
            }
            throw error;
         }

         const refreshToken = await establishSession(user._id);
         const accessToken = await options.tokenService.signAccessToken(user._id);
         log("info", "auth.registration_success", context, { userId: user._id });
         return { accessToken, refreshToken, user: toSafeUser(user) };
      },

      async login(input: LoginInput, context: AuthLogContext = {}): Promise<AuthResult> {
         const user = await options.repository.findUserByEmail(input.email);
         const storedHash = user?.passwordHash ?? (await getDummyHash());
         const valid = await verifyPassword(input.password, storedHash);
         if (!user || !valid) {
            log("warn", "auth.login_failure", context, { userId: user?._id });
            throw new HttpError(401, "INVALID_CREDENTIALS", INVALID_CREDENTIALS_MESSAGE);
         }

         await migrateLegacyPasswordIfNeeded(user, input.password);
         const refreshToken = await establishSession(user._id);
         const accessToken = await options.tokenService.signAccessToken(user._id);
         log("info", "auth.login_success", context, { userId: user._id });
         return { accessToken, refreshToken, user: toSafeUser(user) };
      },

      async refresh(
         refreshToken: string | undefined,
         context: AuthLogContext = {},
      ): Promise<RefreshResult> {
         if (!refreshToken) {
            log("warn", "auth.refresh_failure", context, { reason: "missing_cookie" });
            throw invalidRefreshToken();
         }

         const refreshTokenHash = hashRefreshToken(refreshToken);
         const session = await options.repository.findRefreshSessionByTokenHash(refreshTokenHash);
         const now = new Date(nowMs());
         if (!session) {
            log("warn", "auth.refresh_failure", context, { reason: "unknown_session" });
            throw invalidRefreshToken();
         }

         if (session.revokedAt !== null) {
            await options.repository.revokeRefreshFamily(session.familyId, now);
            log("warn", "auth.refresh_replay", context, {
               securityCode: REFRESH_REPLAY_SECURITY_CODE,
               userId: session.userId,
               familyId: session.familyId,
            });
            throw invalidRefreshToken();
         }

         if (session.replacedBySessionId !== null) {
            log("warn", "auth.refresh_failure", context, {
               userId: session.userId,
               familyId: session.familyId,
               reason: "rotation_in_progress",
            });
            throw invalidRefreshToken();
         }

         if (session.expiresAt.getTime() <= now.getTime()) {
            log("warn", "auth.refresh_failure", context, {
               userId: session.userId,
               reason: "expired_session",
            });
            throw invalidRefreshToken();
         }

         const user = await options.repository.findUserById(session.userId);
         if (!user) {
            await options.repository.revokeRefreshFamily(session.familyId, now);
            log("warn", "auth.refresh_failure", context, {
               userId: session.userId,
               reason: "missing_user",
            });
            throw invalidRefreshToken();
         }

         const nextRefreshToken = randomBytes(32).toString("base64url");
         const nextExpiresAt = new Date(now.getTime() + options.refreshTokenTtlSeconds * 1000);
         const accessToken = await options.tokenService.signAccessToken(user._id);
         const replacement = await options.repository.rotateRefreshSession({
            sessionId: session._id,
            previousRefreshTokenHash: refreshTokenHash,
            userId: session.userId,
            familyId: session.familyId,
            refreshTokenHash: hashRefreshToken(nextRefreshToken),
            expiresAt: nextExpiresAt,
            now,
         });

         if (!replacement) {
            log("warn", "auth.refresh_replay", context, {
               securityCode: REFRESH_REPLAY_SECURITY_CODE,
               userId: session.userId,
               familyId: session.familyId,
            });
            throw invalidRefreshToken();
         }

         log("info", "auth.refresh_success", context, { userId: user._id });
         return { accessToken, refreshToken: nextRefreshToken };
      },

      async authenticateAccessToken(accessToken: string | undefined, context: AuthLogContext = {}) {
         if (!accessToken) {
            throw new HttpError(401, "AUTH_UNAUTHORIZED", "Authentication required.");
         }

         const claims = await options.tokenService.verifyAccessToken(accessToken);
         if (!claims) {
            log("warn", "auth.access_token_failure", context, { reason: "invalid_token" });
            throw invalidAccessToken();
         }

         const user = await options.repository.findUserById(claims.sub);
         if (!user) {
            log("warn", "auth.access_token_failure", context, { reason: "missing_user" });
            throw invalidAccessToken();
         }
         return toSafeUser(user);
      },

      async logout(refreshToken: string | undefined, context: AuthLogContext = {}): Promise<void> {
         if (!refreshToken) {
            log("info", "auth.logout", context, { reason: "missing_cookie" });
            return;
         }

         const session = await options.repository.findRefreshSessionByTokenHash(
            hashRefreshToken(refreshToken),
         );
         if (!session) {
            log("warn", "auth.logout", context, { reason: "unknown_session" });
            return;
         }

         await options.repository.revokeRefreshFamily(session.familyId, new Date(nowMs()));
         log("info", "auth.logout", context, {
            userId: session.userId,
            familyId: session.familyId,
         });
      },
   };
}

export function hashRefreshToken(refreshToken: string): string {
   return createHash("sha256").update(refreshToken).digest("hex");
}

export function toSafeUser(user: UserRecord): SafeUser {
   return {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
   };
}
