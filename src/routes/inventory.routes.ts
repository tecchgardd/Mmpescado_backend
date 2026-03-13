import { Router } from "express";
import { z } from "zod";
import { inventoryController } from "../controller/inventory.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const inventoryRoutes = Router();

const updateInventorySchema = z
  .object({
    quantity: z.number().int().min(0).optional(),
    minQuantity: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização do estoque.",
  });

inventoryRoutes.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  inventoryController.list.bind(inventoryController),
);

inventoryRoutes.get(
  "/product/:productId",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  inventoryController.getByProductId.bind(inventoryController),
);

inventoryRoutes.patch(
  "/product/:productId",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  validateBody(updateInventorySchema),
  inventoryController.update.bind(inventoryController),
);

export default inventoryRoutes;
