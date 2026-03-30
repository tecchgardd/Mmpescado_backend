import type { Request, Response } from "express";
import { createCategoryService } from "../services/category/create-category.service.js";
import { deleteCategoryService } from "../services/category/delete-category.service.js";
import { listCategoriesService } from "../services/category/list-categories.service.js";
import { updateCategoryService } from "../services/category/update-category.service.js";
import { listAllCategoriesService } from "../services/category/list-all-categories.service.js";

class CategoryController {
  async list(_req: Request, res: Response) {
    try {
      const categories = await listCategoriesService();

      return res.status(200).json(categories);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao listar categorias.",
      });
    }
  }

  async listAll(_req: Request, res: Response) {
    try {
      const categories = await listAllCategoriesService();

      return res.status(200).json(categories);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao listar todas categorias.",
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const category = await createCategoryService(req.body);

      return res.status(201).json({
        message: "Categoria criada com sucesso.",
        category,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao criar categoria.",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await updateCategoryService(id, req.body);

      return res.status(200).json({
        message: "Categoria atualizada com sucesso.",
        category,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao atualizar categoria.",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await deleteCategoryService(id);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao deletar categoria.",
      });
    }
  }
}

export const categoryController = new CategoryController();
