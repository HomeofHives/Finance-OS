import { z } from "zod";

export function normalizeEmail(email: string): string {
   return email.trim().toLowerCase();
}

const emailField = z
   .string()
   .trim()
   .min(1, "A valid email is required.")
   .transform(normalizeEmail)
   .pipe(z.email("A valid email is required."));

export const registerSchema = z.object({
   name: z.string().trim().min(1, "Name is required.").max(100, "Name is too long."),
   email: emailField,
   password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password is too long."),
});

export const loginSchema = z.object({
   email: emailField,
   password: z.string().min(1, "Password is required.").max(128, "Password is too long."),
});
