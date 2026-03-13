import { prisma } from "../../database/prisma.js";

type UpdateOrderStatusInput = {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELED";
};

export async function updateOrderStatusService(
  id: string,
  data: UpdateOrderStatusInput,
) {
  const existingOrder = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!existingOrder) {
    throw {
      status: 404,
      message: "Pedido não encontrado.",
    };
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    if (data.status === "CANCELED" && existingOrder.status !== "CANCELED") {
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
    }

    return tx.order.update({
      where: { id },
      data: {
        status: data.status,
      },
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
  });

  return updatedOrder;
}
