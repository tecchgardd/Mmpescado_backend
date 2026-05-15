import { prisma } from "../../database/prisma.js";
import { ensureCustomerForUserService } from "../customer/ensure-customer-for-user.service.js";
import { getWhatsAppUrl } from "../../utils/whatsapp.js";

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
    (payment: any) => payment.status === "APPROVED",
  );

  if (existingApproved) {
    const error: ServiceError = {
      status: 400,
      message: "Este pedido já possui pagamento aprovado.",
    };

    throw error;
  }

  const existingPendingWithCheckout = order.payments.find(
    (payment: any) => payment.status === "PENDING" && Boolean(payment.checkoutUrl),
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
    (payment: any) => payment.status === "PENDING",
  );

  if (!existingPending) {
    const error: ServiceError = {
      status: 404,
      message: "Pagamento pendente não encontrado para este pedido.",
    };

    throw error;
  }

  const checkoutUrl = getWhatsAppUrl({
    orderCode: order.code,
    totalCents: order.totalCents,
  });

  const payment = await prisma.payment.update({
    where: {
      id: existingPending.id,
    },
    data: {
      gateway: "manual",
      gatewayPaymentId: null,
      externalId: order.code,
      checkoutUrl,
      rawResponse: {
        type: "whatsapp",
        url: checkoutUrl,
      } as any,
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
