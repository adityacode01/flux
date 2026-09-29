import { z } from "zod";

export const idParamSchema = z.object({ id: z.string().min(1).max(64) });

/** Positive money value with at most 2 decimal places. */
export const moneySchema = z.coerce
  .number({ invalid_type_error: "Enter a valid amount" })
  .positive("Amount must be greater than 0")
  .max(1_000_000_000, "Amount is too large")
  .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "Use at most 2 decimal places");
