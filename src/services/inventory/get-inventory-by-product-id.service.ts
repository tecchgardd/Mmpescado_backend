import { prisma } from "../../database/prisma.js";

export async function getInventoryByProductIdService(productId: string) {
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!inventory) {
    throw {
      status: 404,
      message: "Estoque não encontrado para este produto.",
    };
  }

  return inventory;
}
