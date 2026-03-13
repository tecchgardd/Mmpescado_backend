import type { Request, Response } from "express";
import { createOrderService } from "../services/order/create-order.service.js";
import { deleteOrderService } from "../services/order/delete-order.service.js";
import { getOrderByIdService } from "../services/order/get-order-by-id.service.js";
import { listOrdersService } from "../services/order/list-orders.service.js";
import { updateOrderStatusService } from "../services/order/update-order-status.service.js";

class OrderController {
  async create(req: Request, res: Response) {
    try {
      const order = await createOrderService(req.body);

      return res.status(201).json({
        message: "Pedido criado com sucesso.",
        order,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao criar pedido.",
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const status = req.query.status ? String(req.query.status) : undefined;
      const customerId = req.query.customerId
        ? String(req.query.customerId)
        : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;

      const result = await listOrdersService({
        page,
        limit,
        status: status as
          | "PENDING"
          | "CONFIRMED"
          | "PREPARING"
          | "SHIPPED"
          | "DELIVERED"
          | "CANCELED"
          | undefined,
        customerId,
        search,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao listar pedidos.",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const order = await getOrderByIdService(req.params.id);

      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao buscar pedido.",
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const order = await updateOrderStatusService(req.params.id, req.body);

      return res.status(200).json({
        message: "Status do pedido atualizado com sucesso.",
        order,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao atualizar pedido.",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await deleteOrderService(req.params.id);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao deletar pedido.",
      });
    }
  }
}

export const orderController = new OrderController();
