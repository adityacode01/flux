import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { DEFAULT_CATEGORIES } from "@/lib/constants/default-categories";
import type { RegisterInput } from "@/validations/auth";

const BCRYPT_COST = 12;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ApiError(409, "An account with this email already exists.", "EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  // User and starter categories are created atomically.
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      categories: {
        create: DEFAULT_CATEGORIES.map((c) => ({ ...c, isDefault: true })),
      },
    },
    select: { id: true, name: true, email: true },
  });
  return user;
}
