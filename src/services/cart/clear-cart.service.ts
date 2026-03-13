import { prisma } from "../../database/prisma.js";

export async function clearCartService(userId: string) {
  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },
    include: {
      cart: true,
    },
  });

  if (!customer?.cart) {
    throw {
      status: 404,
      message: "Carrinho não encontrado.",
    };
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: customer.cart.id,
    },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: {
      id: customer.cart.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return {
    ...updatedCart,
    summary: {
      itemsCount: 0,
      subtotalCents: 0,
    },
  };
}