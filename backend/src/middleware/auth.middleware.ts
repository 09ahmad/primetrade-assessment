import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../config/generated/prisma/enums";

interface JwtPayloadType {
  userId: string;
  role: Role;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
     res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

   if (!token) {
     res.status(401).json({
      success: false,
      message: "Token missing",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded === "string") {
       res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    const payload = decoded as JwtPayloadType;

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};