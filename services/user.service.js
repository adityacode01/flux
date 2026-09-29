import { prisma } from "@/lib/db";

export function getProfile(userId) {
  return prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, name: true, email: true, currency: true } });
}

export function updateProfile(userId, input) {
  return prisma.user.update({ where: { id: userId }, data: input, select: { id: true, name: true, email: true, currency: true } });
}
