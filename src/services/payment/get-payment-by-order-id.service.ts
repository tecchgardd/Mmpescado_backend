import { prisma } from "../../database/prisma.js";

export async function getPaymentByOrderIdService(orderId: string) {
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