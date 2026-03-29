import type { Request, Response } from "express";
import { createProductService } from "../services/product/create-product.service.js";
import { deleteProductService } from "../services/product/delete-product.service.js";
import { listProductsService } from "../services/product/list-products.service.js";
import { updateProductService } from "../services/product/update-product.service.js";
import { uploadProductImageService } from "../services/upload/upload-product-image.service.js";

class ProductController {
  async list(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const search = req.query.search ? String(req.query.search) : undefined;
      const categoryId = req.query.categoryId
        ? String(req.query.categoryId)
        : undefined;
      const isActive =
        req.query.isActive !== undefined
          ? String(req.query.isActive) === "true"
          : undefined;

      const result = await listProductsService({
        page,
        limit,
        search,
        categoryId,
        isActive,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao listar produtos.",
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      let imageUrl: string | undefined;

      if (req.file) {
        const uploaded = await uploadProductImageService(req.file.buffer) as { secure_url: string };
        imageUrl = uploaded.secure_url;
      }
      //

      const product = await createProductService({ ...req.body, imageUrl });

      return res.status(201).json({
        message: "Produto criado com sucesso.",
        product,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao criar produto.",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await updateProductService(id, req.body);

      return res.status(200).json({
        message: "Produto atualizado com sucesso.",
        product,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao atualizar produto.",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await deleteProductService(id);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao deletar produto.",
      });
    }
  }
}

export const productController = new ProductController();
