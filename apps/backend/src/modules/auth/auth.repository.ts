import mongoose from "mongoose";
import { AuthSessionModel, AuthUserModel } from "./auth.model.js";
import {
   DuplicateUserError,
   type AuthRepository,
   type AuthSessionInput,
   type AuthUserInput,
   type RefreshSessionRecord,
   type RotateRefreshSessionInput,
   type UserRecord,
} from "./auth.types.js";

function toUserRecord(document: InstanceType<typeof AuthUserModel>): UserRecord {
   return {
      _id: document._id.toString(),
      name: document.name,
      email: document.email,
      passwordHash: document.passwordHash,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
   };
}

function toRefreshSessionRecord(
   document: InstanceType<typeof AuthSessionModel>,
): RefreshSessionRecord {
   return {
      _id: document._id.toString(),
      userId: document.userId.toString(),
      refreshTokenHash: document.refreshTokenHash,
      familyId: document.familyId,
      expiresAt: document.expiresAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      lastUsedAt: document.lastUsedAt,
      revokedAt: document.revokedAt ?? null,
      replacedBySessionId: document.replacedBySessionId?.toString() ?? null,
   };
}

function isDuplicateKeyError(error: unknown): boolean {
   return (
      typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000
   );
}

export function createAuthRepository(): AuthRepository {
   return {
      async findUserByEmail(email) {
         const document = await AuthUserModel.findOne({ email });
         return document ? toUserRecord(document) : null;
      },

      async findUserById(id) {
         if (!mongoose.isValidObjectId(id)) return null;
         const document = await AuthUserModel.findById(id);
         return document ? toUserRecord(document) : null;
      },

      async createUser(input: AuthUserInput) {
         try {
            const document = await AuthUserModel.create({
               name: input.name,
               email: input.email,
               passwordHash: input.passwordHash,
            });
            return toUserRecord(document);
         } catch (error) {
            if (isDuplicateKeyError(error)) throw new DuplicateUserError();
            throw error;
         }
      },

      async updateUserPasswordHash(userId, passwordHash) {
         if (!mongoose.isValidObjectId(userId)) return;
         const result = await AuthUserModel.updateOne({ _id: userId }, { $set: { passwordHash } });
         if (result.matchedCount === 0)
            throw new Error("User not found during password migration.");
      },

      async createRefreshSession(input: AuthSessionInput) {
         const document = await AuthSessionModel.create({
            userId: input.userId,
            refreshTokenHash: input.refreshTokenHash,
            familyId: input.familyId,
            expiresAt: input.expiresAt,
            lastUsedAt: input.lastUsedAt,
            revokedAt: null,
            replacedBySessionId: null,
         });
         return toRefreshSessionRecord(document);
      },

      async findRefreshSessionByTokenHash(refreshTokenHash) {
         const document = await AuthSessionModel.findOne({ refreshTokenHash });
         return document ? toRefreshSessionRecord(document) : null;
      },

      async rotateRefreshSession(input: RotateRefreshSessionInput) {
         const replacementId = new mongoose.Types.ObjectId();
         const previous = await AuthSessionModel.findOneAndUpdate(
            {
               _id: input.sessionId,
               userId: input.userId,
               familyId: input.familyId,
               refreshTokenHash: input.previousRefreshTokenHash,
               revokedAt: null,
               replacedBySessionId: null,
               expiresAt: { $gt: input.now },
            },
            {
               $set: {
                  lastUsedAt: input.now,
                  replacedBySessionId: replacementId,
               },
            },
            { returnDocument: "after" },
         );
         if (!previous) return null;

         const failClaimedRotation = async () => {
            await Promise.allSettled([
               AuthSessionModel.deleteOne({ _id: replacementId }),
               AuthSessionModel.updateOne(
                  {
                     _id: input.sessionId,
                     replacedBySessionId: replacementId,
                     revokedAt: null,
                  },
                  { $set: { revokedAt: input.now } },
               ),
            ]);
         };

         try {
            const replacement = await AuthSessionModel.create({
               _id: replacementId,
               userId: input.userId,
               refreshTokenHash: input.refreshTokenHash,
               familyId: input.familyId,
               expiresAt: input.expiresAt,
               lastUsedAt: input.now,
               revokedAt: null,
               replacedBySessionId: null,
            });
            const completed = await AuthSessionModel.updateOne(
               {
                  _id: input.sessionId,
                  userId: input.userId,
                  familyId: input.familyId,
                  refreshTokenHash: input.previousRefreshTokenHash,
                  revokedAt: null,
                  replacedBySessionId: replacementId,
               },
               { $set: { revokedAt: input.now } },
            );
            if (completed.matchedCount !== 1) {
               await failClaimedRotation();
               return null;
            }
            return toRefreshSessionRecord(replacement);
         } catch (error) {
            await failClaimedRotation();
            throw error;
         }
      },

      async revokeRefreshFamily(familyId, revokedAt) {
         await AuthSessionModel.updateMany({ familyId, revokedAt: null }, { $set: { revokedAt } });
      },
   };
}
