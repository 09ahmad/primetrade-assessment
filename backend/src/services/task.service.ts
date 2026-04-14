import { prismaClient } from "../utils/generatedClient";
import type { CreateTaskInput, UpdateTaskInput } from "../validators/task.schema";

export const taskService = {
  create(userId: string, input: CreateTaskInput) {
    return prismaClient.task.create({ data: { ...input, userId } });
  },

  list() {
    return prismaClient.task.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    const task = await prismaClient.task.findUnique({ where: { id } });
    if (!task) throw { status: 404, message: "Task not found" };
    return task;
  },

  async update(id: string, data: UpdateTaskInput) {
    await this.getById(id);
    return prismaClient.task.update({ where: { id }, data });
  },

  async remove(id: string) {
    await this.getById(id);
    return prismaClient.task.delete({ where: { id } });
  },
};
