import type { Request, Response } from "express";
import { createCheckoutService } from "../services/payment/create-checkout.service.js";
import { getPaymentByOrderIdService } from "../services/payment/get-payment-by-order-id.service.js";
import { handleAbacatepayWebhookService } from "../services/payment/handle-abacatepay-webhook.service.js";
import { verifyAbacatepayWebhook } from "../services/payment/verify-abacatepay-webhook.service.js";

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

  async webhook(req: Request, res: Response) {
    try {
      const secret = req.query.webhookSecret;
      const signature = req.headers["x-webhook-signature"];

      if (secret !== process.env.ABACATEPAY_WEBHOOK_SECRET) {
        return res.status(401).json({
          message: "Webhook secret inválido.",
        });
      }

      if (!signature || typeof signature !== "string") {
        return res.status(401).json({
          message: "Assinatura do webhook ausente.",
        });
      }

      const rawBody = (req as any).rawBody as string;

      const isValid = verifyAbacatepayWebhook(rawBody, signature);

      if (!isValid) {
        return res.status(401).json({
          message: "Assinatura do webhook inválida.",
        });
      }

      const result = await handleAbacatepayWebhookService(req.body);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status ?? 500).json({
        message: error?.message ?? "Erro ao processar webhook.",
      });
    }
  }
}

export const paymentController = new PaymentController();
