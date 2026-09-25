import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
   createLegacyScryptHash,
   hashPassword,
   isArgon2idHash,
   isLegacyScryptHash,
   verifyPassword,
} from "./password.service.js";

const PASSWORD = "correct horse battery staple";

describe("password service", () => {
   test("hashes new passwords with Argon2id and verifies them", async () => {
      const stored = await hashPassword(PASSWORD);

      assert.match(stored, /^\$argon2id\$/);
      assert.equal(isArgon2idHash(stored), true);
      assert.notEqual(stored, PASSWORD);
      assert.equal(await verifyPassword(PASSWORD, stored), true);
      assert.equal(await verifyPassword("wrong password", stored), false);
   });

   test("verifies the legacy scrypt format without accepting malformed hashes", async () => {
      const stored = createLegacyScryptHash(PASSWORD);

      assert.equal(isLegacyScryptHash(stored), true);
      assert.equal(await verifyPassword(PASSWORD, stored), true);
      assert.equal(await verifyPassword("wrong password", stored), false);
      assert.equal(await verifyPassword(PASSWORD, "scrypt$bad$bad"), false);
      assert.equal(await verifyPassword(PASSWORD, "not-a-password-hash"), false);
   });
});
