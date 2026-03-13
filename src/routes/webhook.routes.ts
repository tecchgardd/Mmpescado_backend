import { Router } from "express";
import { paymentController } from "../controller/payment.controller.js";

const webhookRoutes = Router();

webhookRoutes.post(
  "/abacatepay",
  paymentController.webhook.bind(paymentController),
);

export default webhookRoutes;