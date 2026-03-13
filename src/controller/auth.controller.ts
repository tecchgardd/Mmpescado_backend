import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.registerWithEmail(req.body, req.headers);

      return res.status(201).json({
        message: "Cadastro realizado com sucesso.",
        user: result.user,
        customer: result.customer,
        token: result.token,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao cadastrar usuário.",
      });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Não autenticado.",
        });
      }

      const user = await authService.getMe(userId);

      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao buscar usuário.",
      });
    }
  }

  async createAdminOrStaff(req: Request, res: Response) {
    try {
      const result = await authService.createAdminOrStaff(req.body);

      return res.status(201).json({
        message: "Usuário administrativo criado com sucesso.",
        user: result.user,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao criar usuário administrativo.",
      });
    }
  }
}

export const authController = new AuthController();