import type { Request, Response } from "express";
import { deleteCustomerService } from "../services/customer/delete-customer.service.js";
import { ensureCustomerForUserService } from "../services/customer/ensure-customer-for-user.service.js";
import { listCustomersService } from "../services/customer/list-customers.service.js";
import { updateCustomerService } from "../services/customer/update-customer.service.js";

class CustomerController {

  async getMe(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Não autenticado.",
        });
      }

      const customer = await ensureCustomerForUserService(userId);

      return res.status(200).json(customer);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao buscar dados do cliente.",
      });
    }
  }

  async updateMe(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Não autenticado.",
        });
      }

      const customer = await ensureCustomerForUserService(userId);
      const updatedCustomer = await updateCustomerService(customer.id, req.body);

      return res.status(200).json({
        message: "Seus dados foram atualizados com sucesso.",
        customer: updatedCustomer,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao atualizar seus dados.",
      });
    }
  }
  async list(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const search = req.query.search ? String(req.query.search) : undefined;

      const result = await listCustomersService({
        page,
        limit,
        search,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao listar clientes.",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const customer = await updateCustomerService(id, req.body);

      return res.status(200).json({
        message: "Cliente atualizado com sucesso.",
        customer,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao atualizar cliente.",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await deleteCustomerService(id);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao deletar cliente.",
      });
    }
  }
}

export const customerController = new CustomerController();
