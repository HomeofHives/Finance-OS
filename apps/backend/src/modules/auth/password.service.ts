import { randomBytes, scrypt, scryptSync, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import * as argon2 from "argon2";

const scryptAsync = promisify(scrypt) as {
   (password: string, salt: Buffer, keyLength: number): Promise<Buffer>;
};

const LEGACY_PREFIX = "scrypt";
const LEGACY_SALT_HEX_LENGTH = 32;
const LEGACY_HASH_HEX_LENGTH = 128;

export async function hashPassword(password: string): Promise<string> {
   return argon2.hash(password, { type: argon2.argon2id });
}

export function isArgon2idHash(value: string): boolean {
   return value.startsWith("$argon2id$");
}

export function isLegacyScryptHash(value: string): boolean {
   const [prefix, salt, hash, ...extra] = value.split("$");
   return (
      prefix === "scrypt" &&
      extra.length === 0 &&
      typeof salt === "string" &&
      /^[0-9a-f]+$/.test(salt) &&
      salt.length === LEGACY_SALT_HEX_LENGTH &&
      typeof hash === "string" &&
      /^[0-9a-f]+$/.test(hash) &&
      hash.length === LEGACY_HASH_HEX_LENGTH
   );
}

async function verifyLegacyScryptPassword(password: string, stored: string): Promise<boolean> {
   if (!isLegacyScryptHash(stored)) return false;
   const [, saltHex, hashHex] = stored.split("$");
   const salt = Buffer.from(saltHex, "hex");
   const expected = Buffer.from(hashHex, "hex");
   try {
      const actual = await scryptAsync(password, salt, expected.length);
      return actual.length === expected.length && timingSafeEqual(actual, expected);
   } catch {
      return false;
   }
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
   if (isArgon2idHash(stored)) {
      try {
         return await argon2.verify(stored, password);
      } catch {
         return false;
      }
   }
   if (stored.startsWith(LEGACY_PREFIX)) {
      return verifyLegacyScryptPassword(password, stored);
   }
   return false;
}

export function createLegacyScryptHash(password: string): string {
   const salt = randomBytes(16);
   const derived = scryptSync(password, salt, 64);
   return `${LEGACY_PREFIX}$${salt.toString("hex")}$${derived.toString("hex")}`;
}
