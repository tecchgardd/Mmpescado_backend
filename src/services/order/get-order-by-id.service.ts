import { prisma } from "../../database/prisma.js";

export async function getOrderByIdService(id: string) {
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

  return order;
}
