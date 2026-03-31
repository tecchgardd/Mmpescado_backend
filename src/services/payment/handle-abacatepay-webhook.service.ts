import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type WebhookPayload = {
  event: string;
  devMode?: boolean;
  data: {
    // v1/billing format
    billing?: {
      id?: string;
      externalId?: string;
      url?: string;
      amount?: number;
      paidAmount?: number;
      status?: string;
      updatedAt?: string;
      createdAt?: string;
    };
    // v2/checkout format (legado)
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
  console.log("Received AbacatePay webhook:", payload.data);
  const event = payload.event;
  const billing = payload.data?.billing ?? payload.data?.checkout;
  const rawWebhookJson = toPrismaJson(payload);

  if (!billing?.externalId && !billing?.id) {
    return { ok: true, action: "ignored" };
  }

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        ...(billing.externalId ? [{ externalId: billing.externalId }] : []),
        ...(billing.id ? [{ gatewayPaymentId: billing.id }] : []),
      ],
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
    return { ok: true, action: "ignored" };
  }

  if (event === "billing.paid" || event === "checkout.completed") {
    const paidAt = billing.updatedAt ? new Date(billing.updatedAt) : new Date();

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "APPROVED",
          gatewayPaymentId: billing.id ?? payment.gatewayPaymentId,
          checkoutUrl: billing.url ?? payment.checkoutUrl,
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

  if (event === "billing.refunded" || event === "checkout.refunded") {
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

  if (event === "billing.disputed" || event === "checkout.disputed") {
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