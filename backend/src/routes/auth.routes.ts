import type { Request, Response } from "express";
import { Router } from "express";
import { registerSchema, loginSchema } from "../validators/user.schema";
import { authService } from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const data = await authService.register(parsed.data);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data,
    });
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    res.status(status).json({ success: false, message });
  }
});

authRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const data = await authService.login(parsed.data);
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data,
    });
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    res.status(status).json({ success: false, message });
  }
});