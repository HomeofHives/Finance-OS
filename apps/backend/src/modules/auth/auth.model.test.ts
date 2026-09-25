import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { AuthSessionModel, AuthUserModel } from "./auth.model.js";

describe("auth persistence models", () => {
   test("defines a unique normalized user email and safe user fields", () => {
      assert.equal(AuthUserModel.schema.path("email").options.lowercase, true);
      assert.equal(AuthUserModel.schema.path("email").options.required, true);
      assert.equal(AuthUserModel.schema.path("passwordHash").options.required, true);
      assert.ok(
         AuthUserModel.schema
            .indexes()
            .some(([fields, options]) => fields.email === 1 && options.unique === true),
      );
   });

   test("indexes refresh sessions without TTL-based revocation", () => {
      const indexes = AuthSessionModel.schema.indexes();
      assert.ok(
         indexes.some(
            ([fields, options]) => fields.refreshTokenHash === 1 && options.unique === true,
         ),
      );
      assert.ok(indexes.some(([fields]) => fields.userId === 1));
      assert.ok(indexes.some(([fields]) => fields.familyId === 1));
      assert.ok(indexes.some(([fields]) => fields.expiresAt === 1));
      assert.ok(indexes.every(([, options]) => options.expireAfterSeconds === undefined));
   });
});
