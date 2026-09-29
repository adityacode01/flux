import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email").max(254);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(128),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email,
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/\d/, "Include a number"),
});
