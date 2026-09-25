export interface UserRecord {
   _id: string;
   name: string;
   email: string;
   passwordHash: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface RefreshSessionRecord {
   _id: string;
   userId: string;
   refreshTokenHash: string;
   familyId: string;
   expiresAt: Date;
   createdAt: Date;
   updatedAt: Date;
   lastUsedAt: Date;
   revokedAt: Date | null;
   replacedBySessionId: string | null;
}

export interface SafeUser {
   id: string;
   name: string;
   email: string;
   createdAt: string;
   updatedAt: string;
}

export type AuthSameSite = "strict";

export interface AuthCookieConfig {
   name: string;
   path: string;
   secure: boolean;
   sameSite: AuthSameSite;
   maxAgeSeconds: number;
}

export interface RegisterInput {
   name: string;
   email: string;
   password: string;
}

export interface LoginInput {
   email: string;
   password: string;
}

export interface AuthUserInput {
   name: string;
   email: string;
   passwordHash: string;
}

export interface AuthSessionInput {
   userId: string;
   refreshTokenHash: string;
   familyId: string;
   expiresAt: Date;
   lastUsedAt: Date;
}

export interface RotateRefreshSessionInput {
   sessionId: string;
   previousRefreshTokenHash: string;
   userId: string;
   familyId: string;
   refreshTokenHash: string;
   expiresAt: Date;
   now: Date;
}

export interface AuthRepository {
   findUserByEmail(email: string): Promise<UserRecord | null>;
   findUserById(id: string): Promise<UserRecord | null>;
   createUser(input: AuthUserInput): Promise<UserRecord>;
   updateUserPasswordHash(userId: string, passwordHash: string): Promise<void>;
   createRefreshSession(input: AuthSessionInput): Promise<RefreshSessionRecord>;
   findRefreshSessionByTokenHash(refreshTokenHash: string): Promise<RefreshSessionRecord | null>;
   rotateRefreshSession(input: RotateRefreshSessionInput): Promise<RefreshSessionRecord | null>;
   revokeRefreshFamily(familyId: string, revokedAt: Date): Promise<void>;
}

export interface AuthLogContext {
   requestId?: string;
}

export interface AuthResult {
   accessToken: string;
   refreshToken: string;
   user: SafeUser;
}

export interface RefreshResult {
   accessToken: string;
   refreshToken: string;
}

export interface AuthService {
   register(input: RegisterInput, context?: AuthLogContext): Promise<AuthResult>;
   login(input: LoginInput, context?: AuthLogContext): Promise<AuthResult>;
   refresh(refreshToken: string | undefined, context?: AuthLogContext): Promise<RefreshResult>;
   authenticateAccessToken(
      accessToken: string | undefined,
      context?: AuthLogContext,
   ): Promise<SafeUser>;
   logout(refreshToken: string | undefined, context?: AuthLogContext): Promise<void>;
}

export interface AccessTokenClaims {
   iss: string;
   aud: string | string[];
   sub: string;
   jti: string;
   iat: number;
   exp: number;
}

export interface AccessTokenService {
   signAccessToken(subject: string): Promise<string>;
   verifyAccessToken(token: string): Promise<AccessTokenClaims | null>;
}

export class DuplicateUserError extends Error {
   constructor() {
      super("A user with this email already exists.");
      this.name = "DuplicateUserError";
   }
}
