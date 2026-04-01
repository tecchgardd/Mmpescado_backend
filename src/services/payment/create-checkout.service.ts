import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import {
  createAbacateCustomer,
  createAbacatePayCheckout,
} from "../../integrations/abacatepay.js";
import { ensureCustomerForUserService } from "../customer/ensure-customer-for-user.service.js";
import { ensureAbacateProductService } from "../product/ensure-abacate-product.service.js";

type RequesterRole = "ADMIN" | "STAFF" | "USER";

type ServiceError = {
  status: number;
  message: string;
  details?: unknown;
};

export async function createCheckoutService(
  orderId: string,
  requesterUserId?: string,
  requesterRole?: RequesterRole,
) {
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
    const error: ServiceError = {
      status: 404,
      message: "Pedido não encontrado.",
    };

    throw error;
  }

  if (!order.customer) {
    const error: ServiceError = {
      status: 400,
      message: "Pedido sem cliente vinculado.",
    };

    throw error;
  }

  if (requesterRole === "USER") {
    if (!requesterUserId) {
      const error: ServiceError = {
        status: 401,
        message: "Não autenticado.",
      };

      throw error;
    }

    const customer = await ensureCustomerForUserService(requesterUserId);

    if (order.customerId !== customer.id) {
      const error: ServiceError = {
        status: 403,
        message: "Você não tem permissão para criar checkout para este pedido.",
      };

      throw error;
    }
  }

  if (!order.items.length) {
    const error: ServiceError = {
      status: 400,
      message: "Pedido sem itens.",
    };

    throw error;
  }

  const existingApproved = order.payments.find(
    (payment) => payment.status === "APPROVED",
  );

  if (existingApproved) {
    const error: ServiceError = {
      status: 400,
      message: "Este pedido já possui pagamento aprovado.",
    };

    throw error;
  }

  const existingPendingWithCheckout = order.payments.find(
    (payment) => payment.status === "PENDING" && Boolean(payment.checkoutUrl),
  );

  if (existingPendingWithCheckout) {
    return {
      paymentId: existingPendingWithCheckout.id,
      checkoutUrl: existingPendingWithCheckout.checkoutUrl,
      status: existingPendingWithCheckout.status,
      payment: existingPendingWithCheckout,
      order,
    };
  }

  const existingPending = order.payments.find(
    (payment) => payment.status === "PENDING",
  );

  if (!existingPending) {
    const error: ServiceError = {
      status: 404,
      message: "Pagamento pendente não encontrado para este pedido.",
    };

    throw error;
  }

  const checkoutItems = await Promise.all(
    order.items.map(async (item) => ({
      id: await ensureAbacateProductService(item.productId),
      quantity: item.quantity,
    })),
  );

  let abacateCustomer: { id?: string } | null = null;

  if (order.customer.email) {
    try {
      abacateCustomer = await createAbacateCustomer({
        email: order.customer.email,
        name: order.customer.name,
        cellphone: order.customer.phone ?? undefined,
        taxId: order.customer.document ?? undefined,
        zipCode: order.customer.zipCode ?? undefined,
      });
    } catch (customerError) {
      console.error(
        "Erro ao criar cliente AbacatePay no createCheckoutService:",
        customerError,
      );
    }
  }

  const gatewayResponse = await createAbacatePayCheckout({
    items: checkoutItems,
    externalId: order.code,
    returnUrl:
      process.env.ABACATEPAY_RETURN_URL || process.env.FRONTEND_URL,
    completionUrl:
      process.env.ABACATEPAY_COMPLETION_URL ||
      `${process.env.FRONTEND_URL || ""}/loja/pedidos`,
    customerId: abacateCustomer?.id,
    metadata: {
      orderId: order.id,
      code: order.code,
    },
  });

  const checkoutId = gatewayResponse?.id ?? null;
  const checkoutUrl = gatewayResponse?.url ?? null;

  if (!checkoutUrl) {
    const error: ServiceError = {
      status: 500,
      message: "Checkout criado sem URL de pagamento.",
      details: gatewayResponse,
    };

    throw error;
  }

  const payment = await prisma.payment.update({
    where: {
      id: existingPending.id,
    },
    data: {
      gateway: "abacatepay",
      gatewayPaymentId: checkoutId,
      externalId: order.code,
      checkoutUrl,
      rawResponse: gatewayResponse as Prisma.InputJsonValue,
    },
  });

  return {
    paymentId: payment.id,
    checkoutUrl: payment.checkoutUrl,
    status: payment.status,
    payment,
    order,
  };
}
