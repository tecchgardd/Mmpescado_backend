import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import { createAbacateCheckout } from "./abacatepay-client.js";

export async function createCheckoutService(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
  });

  if (!order) {
    throw {
      status: 404,
      message: "Pedido não encontrado.",
    };
  }

  if (!order.customer) {
    throw {
      status: 400,
      message: "Pedido sem cliente vinculado.",
    };
  }

  if (!order.items.length) {
    throw {
      status: 400,
      message: "Pedido sem itens.",
    };
  }

  const existingApproved = order.payments.find(
    (payment) => payment.status === "APPROVED",
  );

  if (existingApproved) {
    throw {
      status: 400,
      message: "Este pedido já possui pagamento aprovado.",
    };
  }

  const existingPendingWithCheckout = order.payments.find(
    (payment) => payment.status === "PENDING" && !!payment.checkoutUrl,
  );

  if (existingPendingWithCheckout) {
    return {
      paymentId: existingPendingWithCheckout.id,
      checkoutUrl: existingPendingWithCheckout.checkoutUrl,
      status: existingPendingWithCheckout.status,
    };
  }

  const existingPending = order.payments.find(
    (payment) => payment.status === "PENDING",
  );

  if (!existingPending) {
    throw {
      status: 404,
      message: "Pagamento pendente não encontrado para este pedido.",
    };
  }

  const externalId = order.code;

  const payload = {
    frequency: "ONE_TIME" as const,
    methods: ["PIX", "CARD"] as ("PIX" | "CARD")[],
    products: order.items.map((item) => ({
      externalId: item.productId,
      name: item.product.name,
      price: item.unitPriceCents,
      quantity: item.quantity,
    })),
    returnUrl: process.env.ABACATEPAY_RETURN_URL,
    completionUrl: process.env.ABACATEPAY_COMPLETION_URL,
    customer: {
      name: order.customer.name,
      email: order.customer.email ?? "sem-email@mmpescado.local",
      cellphone: order.customer.phone ?? undefined,
      taxId: order.customer.document ?? undefined,
    },
  };

  const gatewayResponse = await createAbacateCheckout(payload);

  const checkoutId =
    gatewayResponse?.data?.id ??
    gatewayResponse?.id ??
    null;

  const checkoutUrl =
    gatewayResponse?.data?.url ??
    gatewayResponse?.url ??
    null;

  if (!checkoutUrl) {
    throw {
      status: 500,
      message: "Checkout criado sem URL de pagamento.",
      details: gatewayResponse,
    };
  }

  const payment = await prisma.payment.update({
    where: {
      id: existingPending.id,
    },
    data: {
      gateway: "abacatepay",
      gatewayPaymentId: checkoutId,
      externalId,
      checkoutUrl,
      rawResponse: gatewayResponse as Prisma.InputJsonValue,
    },
  });

  return {
    paymentId: payment.id,
    checkoutUrl: payment.checkoutUrl,
    status: payment.status,
  };
}