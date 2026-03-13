import { Router } from "express";
import { paymentController } from "../controller/payment.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const paymentRoutes = Router();

paymentRoutes.post(
  "/checkout/:orderId",
  requireAuth,
  requireRole("ADMIN", "STAFF", "USER"),
  paymentController.createCheckout.bind(paymentController),
);

paymentRoutes.get(
  "/order/:orderId",
  requireAuth,
  requireRole("ADMIN", "STAFF", "USER"),
  paymentController.getByOrderId.bind(paymentController),
);

export default paymentRoutes;