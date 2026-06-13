import { z } from "zod/v4";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username должен быть не короче 3 символов")
    .max(100, "Username должен быть не длиннее 100 символов"),
  password: z.string().min(4, "Password должен быть не короче 4 символов"),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .max(100, "Имя должно быть не длиннее 100 символов")
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
});

export type LoginValues = z.output<typeof loginSchema>;
export type RegisterValues = z.output<typeof registerSchema>;
