import { z } from "zod";
import { moneySchema } from "./common";

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Choose a category"),
  amount: moneySchema,
});

export const updateBudgetSchema = z.object({ amount: moneySchema });

export const listBudgetsSchema = z.object({
  // YYYY-MM; defaults to the current month
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM").optional(),
});
