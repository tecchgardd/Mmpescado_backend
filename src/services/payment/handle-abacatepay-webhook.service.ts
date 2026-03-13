import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type WebhookPayload = {
  event: string;
  apiVersion: number;
  devMode: boolean;
  data: {
    checkout?: {
      id?: string;
      externalId?: string;
      url?: string;
      amount?: number;
      paidAmount?: number;
      status?: string;
      receiptUrl?: string;
      updatedAt?: string;
      createdAt?: string;
    };
    customer?: {
      id?: string;
      name?: string;
      email?: string;
      taxId?: string;
    };
    payerInformation?: JsonObject | JsonValue[] | null;
    reason?: string;
  };
};

function toPrismaJson(value: WebhookPayload): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

export async function handleAbacatepayWebhookService(
  payload: WebhookPayload,
) {
  const event = payload.event;
  const checkout = payload.data?.checkout;
  const rawWebhookJson = toPrismaJson(payload);

  if (!checkout?.externalId) {
    throw {
      status: 400,
      message: "Webhook sem externalId.",
    };
  }

  const payment = await prisma.payment.findFirst({
    where: {
      externalId: checkout.externalId,
    },
    include: {
      order: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!payment) {
    throw {
      status: 404,
      message: "Pagamento não encontrado para o externalId informado.",
    };
  }

  if (event === "checkout.completed") {
    const paidAt = checkout.updatedAt ? new Date(checkout.updatedAt) : new Date();

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "APPROVED",
          gatewayPaymentId: checkout.id ?? payment.gatewayPaymentId,
          checkoutUrl: checkout.url ?? payment.checkoutUrl,
          rawWebhook: rawWebhookJson,
          paidAt,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: "CONFIRMED",
        },
      });
    });

    return { ok: true, action: "approved" };
  }

  if (event === "checkout.refunded") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "REFUNDED",
          rawWebhook: rawWebhookJson,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: "CANCELED",
        },
      });

      for (const item of payment.order.items) {
        const inventory = await tx.inventory.findUnique({
          where: {
            productId: item.productId,
          },
        });

        if (inventory) {
          await tx.inventory.update({
            where: {
              productId: item.productId,
            },
            data: {
              quantity: inventory.quantity + item.quantity,
            },
          });
        }
      }
    });

    return { ok: true, action: "refunded" };
  }

  if (event === "checkout.disputed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        rawWebhook: rawWebhookJson,
      },
    });

    return { ok: true, action: "disputed" };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      rawWebhook: rawWebhookJson,
    },
  });

  return { ok: true, action: "ignored" };
}