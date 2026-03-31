import { prisma } from "../../database/prisma.js";
import { ensureCustomerForUserService } from "../customer/ensure-customer-for-user.service.js";

export async function getPaymentByOrderIdService(
  orderId: string,
  requesterUserId?: string,
  requesterRole?: "ADMIN" | "STAFF" | "USER",
) {
  if (requesterRole === "USER") {
    if (!requesterUserId) {
      throw {
        status: 401,
        message: "Não autenticado.",
      };
    }

    const customer = await ensureCustomerForUserService(requesterUserId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });

    if (!order) {
      throw {
        status: 404,
        message: "Pedido não encontrado.",
      };
    }

    if (order.customerId !== customer.id) {
      throw {
        status: 403,
        message: "Você não tem permissão para acessar este pagamento.",
      };
    }
  }

  const payment = await prisma.payment.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  if (!payment) {
    throw {
      status: 404,
      message: "Pagamento não encontrado para este pedido.",
    };
  }

  return payment;
}