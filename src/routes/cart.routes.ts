import { Router } from "express";
import { z } from "zod";
import { cartController } from "../controller/cart.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const cartRoutes = Router();

const addItemSchema = z.object({
  productId: z.string().min(1, "ProductId é obrigatório."),
  quantity: z.number().int().positive("Quantidade deve ser maior que zero."),
});

const updateItemSchema = z.object({
  quantity: z.number().int().positive("Quantidade deve ser maior que zero."),
});

cartRoutes.get(
  "/me",
  requireAuth,
  requireRole("USER", "ADMIN", "STAFF"),
  cartController.getMyCart.bind(cartController),
);

cartRoutes.post(
  "/items",
  requireAuth,
  requireRole("USER", "ADMIN", "STAFF"),
  validateBody(addItemSchema),
  cartController.addItem.bind(cartController),
);

cartRoutes.patch(
  "/items/:itemId",
  requireAuth,
  requireRole("USER", "ADMIN", "STAFF"),
  validateBody(updateItemSchema),
  cartController.updateItem.bind(cartController),
);

cartRoutes.delete(
  "/items/:itemId",
  requireAuth,
  requireRole("USER", "ADMIN", "STAFF"),
  cartController.removeItem.bind(cartController),
);

cartRoutes.delete(
  "/clear",
  requireAuth,
  requireRole("USER", "ADMIN", "STAFF"),
  cartController.clear.bind(cartController),
);

export default cartRoutes;