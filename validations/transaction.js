import { z } from "zod";
import { moneySchema, transactionTypeSchema } from "./common";

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: moneySchema,
  categoryId: z.string().min(1, "Choose a category"),
  description: z.string().trim().min(1, "Description is required").max(140),
  notes: z.string().trim().max(1000).optional().nullable(),
  date: z.coerce.date({ invalid_type_error: "Enter a valid date" }),
});

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update");

export const listTransactionsSchema = z.object({
  q: z.string().trim().max(100).optional(),
  type: transactionTypeSchema.optional(),
  categoryId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
