import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: "CANDIDATE" | "RECRUITER" | "ADMIN";
    }
  }
}

export type AuthenticatedRequest = Request;

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: "CANDIDATE" | "RECRUITER" | "ADMIN";
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden. Insufficient permissions." });
    }
    next();
  };
};
