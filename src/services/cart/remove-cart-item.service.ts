import { prisma } from "../../database/prisma.js";

export async function removeCartItemService(userId: string, itemId: string) {
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

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!cartItem || cartItem.cartId !== customer.cart.id) {
    throw {
      status: 404,
      message: "Item do carrinho não encontrado.",
    };
  }

  await prisma.cartItem.delete({
    where: {
      id: itemId,
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

  const subtotalCents = updatedCart?.items.reduce((acc, item) => acc + item.totalCents, 0) ?? 0;

  return {
    ...updatedCart,
    summary: {
      itemsCount: updatedCart?.items.length ?? 0,
      subtotalCents,
    },
  };
}