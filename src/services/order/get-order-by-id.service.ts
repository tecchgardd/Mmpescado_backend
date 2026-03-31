import { prisma } from "../../database/prisma.js";
import { ensureCustomerForUserService } from "../customer/ensure-customer-for-user.service.js";

export async function getOrderByIdService(
  id: string,
  requesterUserId?: string,
  requesterRole?: "ADMIN" | "STAFF" | "USER",
) {
  const order = await prisma.order.findUnique({
    where: { id },
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

  if (requesterRole === "USER") {
    if (!requesterUserId) {
      throw {
        status: 401,
        message: "Não autenticado.",
      };
    }

    const customer = await ensureCustomerForUserService(requesterUserId);

    if (order.customerId !== customer.id) {
      throw {
        status: 403,
        message: "Você não tem permissão para acessar este pedido.",
      };
    }
  }

  return order;
}
