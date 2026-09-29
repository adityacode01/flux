import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80).optional(),
    currency: z.enum(["INR", "USD", "EUR"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update");
