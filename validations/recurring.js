import { z } from "zod";
import { moneySchema, transactionTypeSchema } from "./common";

const frequency = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

const base = z.object({
  type: transactionTypeSchema,
  amount: moneySchema,
  categoryId: z.string().min(1, "Choose a category"),
  description: z.string().trim().min(1, "Description is required").max(140),
  frequency,
  startDate: z.coerce.date({ invalid_type_error: "Enter a valid start date" }),
  endDate: z.coerce.date().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const createRecurringSchema = base.refine((v) => !v.endDate || v.endDate >= v.startDate, {
  message: "End date must be on or after the start date",
  path: ["endDate"],
});

// startDate is fixed after creation: it anchors the schedule and generated transactions.
export const updateRecurringSchema = base
  .omit({ startDate: true })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update");
