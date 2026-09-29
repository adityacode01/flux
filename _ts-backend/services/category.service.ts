import { prisma } from "@/lib/db";
import { ApiError, notFound } from "@/lib/api";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/validations/category";

export function listCategories(userId: string) {
  return prisma.category.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] });
}

export function createCategory(userId: string, input: CreateCategoryInput) {
  return prisma.category.create({
    data: { userId, name: input.name, type: input.type ?? null, icon: input.icon, color: input.color ?? null },
  });
}

export async function updateCategory(userId: string, id: string, input: UpdateCategoryInput) {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) throw notFound("Category");
  if (category.isDefault && (input.name !== undefined || input.type !== undefined)) {
    throw new ApiError(422, "Default categories can only change icon or color.", "DEFAULT_CATEGORY");
  }
  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(userId: string, id: string) {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) throw notFound("Category");
  if (category.isDefault) throw new ApiError(422, "Default categories cannot be deleted.", "DEFAULT_CATEGORY");

  const inUse = await prisma.transaction.count({ where: { userId, categoryId: id } });
  if (inUse > 0) {
    throw new ApiError(409, `This category is used by ${inUse} transaction(s). Reassign them first.`, "CATEGORY_IN_USE");
  }
  await prisma.category.delete({ where: { id } });
}
