import type { Request, Response } from "express";
import { deleteUserService } from "../services/user/delete-user.service.js";
import { listUsersService } from "../services/user/list-users.service.js";
import { updateUserService } from "../services/user/update-user.service.js";

class UserController {
  async list(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const search = req.query.search ? String(req.query.search) : undefined;
      const role = req.query.role
        ? (String(req.query.role) as "ADMIN" | "STAFF" | "USER")
        : undefined;

      const result = await listUsersService({
        page,
        limit,
        search,
        role,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao listar usuários.",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await updateUserService(id, req.body);

      return res.status(200).json({
        message: "Usuário atualizado com sucesso.",
        user,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao atualizar usuário.",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await deleteUserService(id);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao deletar usuário.",
      });
    }
  }
}

export const userController = new UserController();
