import type { Request, Response, NextFunction } from "express";
import type { Role } from "../config/generated/prisma/enums";

export function authorizationMiddleware(...authorizeRole: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!authorizeRole.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient role",
      });
    }
    next();
  };
}