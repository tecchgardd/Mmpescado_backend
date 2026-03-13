import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers as Record<string, string | string[]>),
    });

    if (!sessionData?.session || !sessionData?.user) {
      return res.status(401).json({
        message: "Não autenticado.",
      });
    }

    req.session = sessionData.session;
    req.currentUser = sessionData.user;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Sessão inválida ou expirada.",
    });
  }
}