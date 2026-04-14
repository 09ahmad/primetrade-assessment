import { prismaClient } from "../utils/generatedClient";
import type { Role } from "../config/generated/prisma/enums";

export const userService = {
  async getAllUsers() {
    return prismaClient.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getCurrentUser(id: string) {
    const user = await prismaClient.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) throw { status: 404, message: "User not found" };
    return user;
  },

  async updateRole(id: string, role: Role) {
    return prismaClient.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  },
};