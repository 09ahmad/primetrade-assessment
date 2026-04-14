import type { Request, Response } from "express";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createTaskSchema, updateTaskSchema } from "../validators/task.schema";
import { taskService } from "../services/task.service";

export const taskRouter = Router();

taskRouter.post("/tasks", authMiddleware, async (req: Request, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }

  const task = await taskService.create(req.user!.userId, parsed.data);
  return res.status(201).json({ success: true, data: task });
});

taskRouter.get("/tasks", authMiddleware, async (req: Request, res: Response) => {
  const tasks = await taskService.list(req.user!.role as "ADMIN" | "USER", req.user!.userId);
  return res.status(200).json({ success: true, data: tasks });
});

taskRouter.get("/tasks/:id", authMiddleware, async (req: Request, res: Response) => {
  const taskId = req.params.id as string;
  const task = await taskService.getById(taskId, req.user!.role as "ADMIN" | "USER", req.user!.userId);
  return res.status(200).json({ success: true, data: task });
});

taskRouter.patch("/tasks/:id", authMiddleware, async (req: Request, res: Response) => {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }

  const taskId = req.params.id as string;
  const updated = await taskService.update(taskId, req.user!.role as "ADMIN" | "USER", req.user!.userId, parsed.data);
  return res.status(200).json({ success: true, data: updated });
});

taskRouter.delete("/tasks/:id", authMiddleware, async (req: Request, res: Response) => {
  const taskId = req.params.id as string;
  await taskService.remove(taskId, req.user!.role as "ADMIN" | "USER", req.user!.userId);
  return res.status(200).json({ success: true, message: "Task deleted" });
});
