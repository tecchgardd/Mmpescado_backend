import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth.js";
import { prisma } from "../database/prisma.js";

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

    const fullUser = await prisma.user.findUnique({
      where: {
        id: sessionData.user.id,
      },
    });

    if (!fullUser) {
      return res.status(401).json({
        message: "Usuário não encontrado.",
      });
    }

    req.session = sessionData.session;
    req.currentUser = fullUser;

    return next();
  } catch (error) {
    console.error("Erro no requireAuth:", error);

    return res.status(401).json({
      message: "Sessão inválida ou expirada.",
    });
  }
}