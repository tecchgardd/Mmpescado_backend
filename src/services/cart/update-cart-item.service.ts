import { prisma } from "../../database/prisma.js";

type UpdateCartItemInput = {
  userId: string;
  itemId: string;
  quantity: number;
};

export async function updateCartItemService(input: UpdateCartItemInput) {
  const customer = await prisma.customer.findUnique({
    where: {
      userId: input.userId,
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
      id: input.itemId,
    },
    include: {
      product: {
        include: {
          inventory: true,
        },
      },
    },
  });

  if (!cartItem || cartItem.cartId !== customer.cart.id) {
    throw {
      status: 404,
      message: "Item do carrinho não encontrado.",
    };
  }

  if (input.quantity <= 0) {
    throw {
      status: 400,
      message: "Quantidade inválida.",
    };
  }

  const availableStock = cartItem.product.inventory?.quantity ?? 0;

  if (input.quantity > availableStock) {
    throw {
      status: 400,
      message: "Quantidade maior que o estoque disponível.",
    };
  }

  const unitPriceCents = cartItem.product.promoPriceCents ?? cartItem.product.priceCents;
  const totalCents = unitPriceCents * input.quantity;

  await prisma.cartItem.update({
    where: {
      id: cartItem.id,
    },
    data: {
      quantity: input.quantity,
      unitPriceCents,
      totalCents,
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