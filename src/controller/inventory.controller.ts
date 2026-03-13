import type { Request, Response } from "express";
import { getInventoryByProductIdService } from "../services/inventory/get-inventory-by-product-id.service.js";
import { listInventoryService } from "../services/inventory/list-inventory.service.js";
import { updateInventoryService } from "../services/inventory/update-inventory.service.js";

class InventoryController {
  async list(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const search = req.query.search ? String(req.query.search) : undefined;
      const lowStock = req.query.lowStock === "true";

      const result = await listInventoryService({
        page,
        limit,
        search,
        lowStock,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao listar estoque.",
      });
    }
  }

  async getByProductId(req: Request, res: Response) {
    try {
      const inventory = await getInventoryByProductIdService(req.params.productId);

      return res.status(200).json(inventory);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao buscar estoque.",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const inventory = await updateInventoryService(req.params.productId, req.body);

      return res.status(200).json({
        message: "Estoque atualizado com sucesso.",
        inventory,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao atualizar estoque.",
      });
    }
  }
}

export const inventoryController = new InventoryController();
