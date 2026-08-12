import { z } from "zod";

const envSchema = z.object({
   NODE_ENV: z
      .enum([
         "development",
         "production",
         "test"
      ])
      .default("development"),

   PORT: z
      .coerce
      .number()
      .default(5000),

   MONGODB_URI: z
      .string()
      .optional(),

   JWT_SECRET: z
      .string()
      .min(10)
      .optional(),
});

export const env = envSchema.parse(process.env);
