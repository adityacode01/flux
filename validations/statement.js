import { z } from "zod";

export const statementQuerySchema = z.object({
  range: z.enum(["7d", "30d", "6m"]).default("30d"),
});