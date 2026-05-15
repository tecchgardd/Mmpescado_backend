import type { Request, Response } from "express";
import { createCheckoutService } from "../services/payment/create-checkout.service.js";
import { getPaymentByOrderIdService } from "../services/payment/get-payment-by-order-id.service.js";

class PaymentController {
  async createCheckout(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const result = await createCheckoutService(
        orderId,
        req.currentUser?.id,
        (req.currentUser as any)?.role as "ADMIN" | "STAFF" | "USER" | undefined,
      );

      return res.status(201).json({
        message: "Checkout criado com sucesso.",
        ...result,
        redirectUrl: result.checkoutUrl,
        paymentUrl: result.checkoutUrl,
        url: result.checkoutUrl,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao criar checkout.",
        details: error?.details,
      });
    }
  }

  async getByOrderId(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const result = await getPaymentByOrderIdService(
        orderId,
        req.currentUser?.id,
        (req.currentUser as any)?.role as "ADMIN" | "STAFF" | "USER" | undefined,
      );

      return res.status(200).json({
        ...result,
        redirectUrl: result.checkoutUrl ?? null,
        paymentUrl: result.checkoutUrl ?? null,
        url: result.checkoutUrl ?? null,
      });
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao buscar pagamento.",
      });
    }
  }

}

export const paymentController = new PaymentController();
