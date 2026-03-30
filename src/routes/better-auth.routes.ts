import express, { Router } from "express";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth.js";
import { prisma } from "../database/prisma.js";

const betterAuthRoutes = Router();

betterAuthRoutes.post(
  "/sign-in/email/admin",
  express.json(),
  async (req, res) => {
    try {
      const { email, password } = req.body ?? {};

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email e senha são obrigatórios." });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: { role: true },
      });

      if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
        return res.status(403).json({
          message:
            "Acesso negado. Apenas administradores e colaboradores podem acessar este portal.",
        });
      }

      const betterAuthRes = await auth.api.signInEmail({
        body: { email, password },
        headers: fromNodeHeaders(req.headers as Record<string, string | string[]>),
        asResponse: true,
      });

      const setCookieHeader = betterAuthRes.headers.get("set-cookie");
      if (setCookieHeader) {
        res.setHeader("Set-Cookie", setCookieHeader);
      }

      const body = await betterAuthRes.json();
      return res.status(betterAuthRes.status).json(body);
    } catch (error) {
      console.error("Erro no login admin:", error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  },
);

betterAuthRoutes.all("/*", toNodeHandler(auth));

export default betterAuthRoutes;