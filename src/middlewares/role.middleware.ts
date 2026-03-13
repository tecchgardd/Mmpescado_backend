import type { NextFunction, Request, Response } from "express";

type AppRole = "ADMIN" | "STAFF" | "USER";

export function requireRole(...allowedRoles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.currentUser as (typeof req.currentUser & { role?: AppRole }) | null;

    if (!user) {
      return res.status(401).json({
        message: "Não autenticado.",
      });
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Acesso negado.",
      });
    }

    return next();
  };
}