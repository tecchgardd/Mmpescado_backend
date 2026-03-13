import { prisma } from "../../database/prisma.js";

type UpdateInventoryInput = {
  quantity?: number;
  minQuantity?: number;
};

export async function updateInventoryService(
  productId: string,
  data: UpdateInventoryInput,
) {
  const existingInventory = await prisma.inventory.findUnique({
    where: { productId },
  });

  if (!existingInventory) {
    throw {
      status: 404,
      message: "Estoque não encontrado para este produto.",
    };
  }

  return prisma.inventory.update({
    where: { productId },
    data: {
      ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
      ...(data.minQuantity !== undefined
        ? { minQuantity: data.minQuantity }
        : {}),
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });
}
