import { prisma } from "../../database/prisma.js";

export async function deleteOrderService(id: string) {
  const existingOrder = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
    },
  });

  if (!existingOrder) {
    throw {
      status: 404,
      message: "Pedido não encontrado.",
    };
  }

  await prisma.$transaction(async (tx) => {
    for (const item of existingOrder.items) {
      await tx.inventory.update({
        where: {
          productId: item.productId,
        },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }

    await tx.payment.deleteMany({
      where: {
        orderId: id,
      },
    });

    await tx.orderItem.deleteMany({
      where: {
        orderId: id,
      },
    });

    await tx.order.delete({
      where: {
        id,
      },
    });
  });

  return {
    message: "Pedido deletado com sucesso.",
  };
}
