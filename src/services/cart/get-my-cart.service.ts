import { prisma } from "../../database/prisma.js";
import { getOrCreateCartService } from "./get-or-create-cart.service.js";

export async function getMyCartService(userId: string) {
  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },
  });

  if (!customer) {
    throw {
      status: 404,
      message: "Customer não encontrado para este usuário.",
    };
  }

  const cart = await getOrCreateCartService(customer.id);

  const subtotalCents = cart.items.reduce((acc, item) => acc + item.totalCents, 0);

  return {
    ...cart,
    summary: {
      itemsCount: cart.items.length,
      subtotalCents,
    },
  };
}