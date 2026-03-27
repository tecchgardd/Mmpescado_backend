import { Router } from "express";
import { z } from "zod";
import { orderController } from "../controller/order.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const orderRoutes = Router();

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
