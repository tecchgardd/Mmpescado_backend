import { Router } from "express";
import { z } from "zod";
import { orderController } from "../controller/order.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const orderRoutes = Router();

const createOrderSchema = z.object({
  customerId: z.string().min(1, "customerId é obrigatório."),
  discountCents: z.number().int().min(0).optional(),
  shippingCents: z.number().int().min(0).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "productId é obrigatório."),
        quantity: z.number().int().positive("quantity deve ser maior que zero."),
      }),
    )
    .min(1, "O pedido precisa ter ao menos um item."),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
    "CANCELED",
  ]),
});

orderRoutes.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  validateBody(createOrderSchema),
  orderController.create.bind(orderController),
);

orderRoutes.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  orderController.list.bind(orderController),
);

orderRoutes.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  orderController.getById.bind(orderController),
);

orderRoutes.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  validateBody(updateOrderStatusSchema),
  orderController.updateStatus.bind(orderController),
);

orderRoutes.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  orderController.delete.bind(orderController),
);

export default orderRoutes;
