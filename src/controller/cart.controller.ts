import type { Request, Response } from "express";
import { addCartItemService } from "../services/cart/add-cart-item.service.js";
import { clearCartService } from "../services/cart/clear-cart.service.js";
import { getMyCartService } from "../services/cart/get-my-cart.service.js";
import { removeCartItemService } from "../services/cart/remove-cart-item.service.js";
import { updateCartItemService } from "../services/cart/update-cart-item.service.js";

class CartController {
  async getMyCart(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Não autenticado.",
        });
      }

      const cart = await getMyCartService(userId);

      return res.status(200).json(cart);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao buscar carrinho.",
      });
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Não autenticado.",
        });
      }

      const cart = await addCartItemService({
        userId,
        productId: req.body.productId,
        quantity: req.body.quantity,
      });

      return res.status(200).json({
        message: "Item adicionado ao carrinho com sucesso.",
        cart,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao adicionar item ao carrinho.",
      });
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      const { itemId } = req.params;

      if (!userId) {
        return res.status(401).json({
          message: "Não autenticado.",
        });
      }

      const cart = await updateCartItemService({
        userId,
        itemId,
        quantity: req.body.quantity,
      });

      return res.status(200).json({
        message: "Item do carrinho atualizado com sucesso.",
        cart,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao atualizar item do carrinho.",
      });
    }
  }

  async removeItem(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      const { itemId } = req.params;

      if (!userId) {
        return res.status(401).json({
          message: "Não autenticado.",
        });
      }

      const cart = await removeCartItemService(userId, itemId);

      return res.status(200).json({
        message: "Item removido do carrinho com sucesso.",
        cart,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao remover item do carrinho.",
      });
    }
  }

  async clear(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Não autenticado.",
        });
      }

      const cart = await clearCartService(userId);

      return res.status(200).json({
        message: "Carrinho limpo com sucesso.",
        cart,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao limpar carrinho.",
      });
    }
  }
}

export const cartController = new CartController();