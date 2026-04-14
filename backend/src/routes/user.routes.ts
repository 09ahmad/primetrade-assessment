import type { Request, Response } from "express";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizationMiddleware } from "../middleware/role.middleware";
import { userService } from "../services/user.service";
import { z } from "zod";

export const userRouter = Router();

const updateRoleSchema = z.object({ role: z.enum(["ADMIN", "USER"]) });

userRouter.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const user = await userService.getCurrentUser(req.user!.userId);
  return res.status(200).json({ success: true, data: user });
});

userRouter.get("/users", authMiddleware, authorizationMiddleware("ADMIN"), async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  return res.status(200).json({ success: true, data: users });
});

userRouter.patch("/users/:id/role", authMiddleware, authorizationMiddleware("ADMIN"), async (req: Request, res: Response) => {
  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }
  const userId = req.params.id as string;
  const updated = await userService.updateRole(userId, parsed.data.role);
  return res.status(200).json({ success: true, message: "User role updated", data: updated });
});