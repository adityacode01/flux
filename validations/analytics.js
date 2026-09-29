import { z } from "zod";

export const analyticsQuerySchema = z
  .object({
    range: z.enum(["7d", "30d", "3m", "6m", "1y", "custom"]).default("6m"),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((v) => v.range !== "custom" || (v.from && v.to), { message: "Custom range needs from and to", path: ["from"] })
  .refine((v) => !v.from || !v.to || v.from <= v.to, { message: "From must be before to", path: ["from"] })
  .refine((v) => v.range !== "custom" || (v.to - v.from) / 86_400_000 <= 366 * 3, { message: "Range is too long (max 3 years)", path: ["to"] });
