import type { Request, Response } from "express";
import { createOrderService } from "../services/order/create-order.service.js";
import { deleteOrderService } from "../services/order/delete-order.service.js";
import { getOrderByIdService } from "../services/order/get-order-by-id.service.js";
import { listOrdersService } from "../services/order/list-orders.service.js";
import { updateOrderStatusService } from "../services/order/update-order-status.service.js";

class OrderController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Não autenticado.",
        });
      }

      const result = await createOrderService({
        userId,
        ...req.body,
      });

      return res.status(201).json({
        message: "Pedido criado com sucesso.",
        ...result,
      });
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);

      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao criar pedido.",
        error:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          undefined,
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
        requesterUserId: req.currentUser?.id,
        requesterRole: (req.currentUser as any)?.role as
          | "ADMIN"
          | "STAFF"
          | "USER"
          | undefined,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao listar pedidos.",
      });
    }
  }

  async listMine(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Não autenticado.",
        });
      }

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const status = req.query.status ? String(req.query.status) : undefined;
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
        search,
        requesterUserId: userId,
        requesterRole: "USER",
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao listar seus pedidos.",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const order = await getOrderByIdService(
        req.params.id,
        req.currentUser?.id,
        (req.currentUser as any)?.role as
          | "ADMIN"
          | "STAFF"
          | "USER"
          | undefined,
      );

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