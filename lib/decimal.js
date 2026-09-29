/** Prisma Decimal | number | null -> number rounded to 2 places. */
export const num = (value) => (value == null ? 0 : Math.round(Number(value) * 100) / 100);

export const round1 = (value) => Math.round(value * 10) / 10;
