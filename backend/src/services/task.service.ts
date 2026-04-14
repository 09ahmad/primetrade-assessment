import { prismaClient } from "../utils/generatedClient";
import type { CreateTaskInput, UpdateTaskInput } from "../validators/task.schema";

export const taskService = {
  create(userId: string, input: CreateTaskInput) {
    return prismaClient.task.create({ data: { ...input, userId } });
  },

  list(role: "ADMIN" | "USER", userId: string) {
    return prismaClient.task.findMany({
      where: role === "ADMIN" ? {} : { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string, role: "ADMIN" | "USER", userId: string) {
    const task = await prismaClient.task.findUnique({ where: { id } });
    if (!task) throw { status: 404, message: "Task not found" };
    if (role !== "ADMIN" && task.userId !== userId) {
      throw { status: 403, message: "Access denied" };
    }
    return task;
  },

  async update(id: string, role: "ADMIN" | "USER", userId: string, data: UpdateTaskInput) {
    await this.getById(id, role, userId);
    return prismaClient.task.update({ where: { id }, data });
  },

  async remove(id: string, role: "ADMIN" | "USER", userId: string) {
    await this.getById(id, role, userId);
    return prismaClient.task.delete({ where: { id } });
  },
};
