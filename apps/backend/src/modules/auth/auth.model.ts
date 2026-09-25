import mongoose, { type Model } from "mongoose";

export interface AuthUserAttributes {
   name: string;
   email: string;
   passwordHash: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface AuthSessionAttributes {
   userId: mongoose.Types.ObjectId;
   refreshTokenHash: string;
   familyId: string;
   expiresAt: Date;
   createdAt: Date;
   updatedAt: Date;
   lastUsedAt: Date;
   revokedAt: Date | null;
   replacedBySessionId: mongoose.Types.ObjectId | null;
}

const userSchema = new mongoose.Schema<AuthUserAttributes>(
   {
      name: { type: String, required: true, trim: true },
      email: {
         type: String,
         required: true,
         trim: true,
         lowercase: true,
      },
      passwordHash: { type: String, required: true },
   },
   {
      timestamps: true,
   },
);

const sessionSchema = new mongoose.Schema<AuthSessionAttributes>(
   {
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "AuthUser",
         required: true,
      },
      refreshTokenHash: { type: String, required: true },
      familyId: { type: String, required: true },
      expiresAt: { type: Date, required: true },
      lastUsedAt: { type: Date, required: true },
      revokedAt: { type: Date, default: null },
      replacedBySessionId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "AuthSession",
         default: null,
      },
   },
   {
      timestamps: true,
   },
);

userSchema.index({ email: 1 }, { unique: true });
sessionSchema.index({ refreshTokenHash: 1 }, { unique: true });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ familyId: 1 });
sessionSchema.index({ expiresAt: 1 });

const existingUserModel = mongoose.models.AuthUser as Model<AuthUserAttributes> | undefined;
const existingSessionModel = mongoose.models.AuthSession as
   Model<AuthSessionAttributes> | undefined;

export const AuthUserModel =
   existingUserModel ?? mongoose.model<AuthUserAttributes>("AuthUser", userSchema);
export const AuthSessionModel =
   existingSessionModel ?? mongoose.model<AuthSessionAttributes>("AuthSession", sessionSchema);
