import { prisma } from "../../database/prisma.js";
import { ensureCustomerForUserService } from "../customer/ensure-customer-for-user.service.js";
import { getOrCreateCartService } from "./get-or-create-cart.service.js";

type AddCartItemInput = {
  userId: string;
  productId: string;
  quantity: number;
};

export async function addCartItemService(input: AddCartItemInput) {
  const customer = await ensureCustomerForUserService(input.userId);

  const product = await prisma.product.findUnique({
    where: {
      id: input.productId,
    },
    include: {
      inventory: true,
    },
  });

  if (!product) {
    throw {
      status: 404,
      message: "Produto não encontrado.",
    };
  }

  if (!product.isActive) {
    throw {
      status: 400,
      message: "Produto inativo.",
    };
  }

  if (!product.inventory) {
    throw {
      status: 400,
      message: "Produto sem controle de estoque.",
    };
  }

  if (input.quantity <= 0) {
    throw {
      status: 400,
      message: "Quantidade inválida.",
    };
  }

  const cart = await getOrCreateCartService(customer.id);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: product.id,
      },
    },
  });

  const currentQuantity = existingItem?.quantity ?? 0;
  const newQuantity = currentQuantity + input.quantity;

  if (newQuantity > product.inventory.quantity) {
    throw {
      status: 400,
      message: "Quantidade solicitada maior que o estoque disponível.",
    };
  }

  const unitPriceCents = product.promoPriceCents ?? product.priceCents;
  const totalCents = unitPriceCents * newQuantity;

  if (existingItem) {
    await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: newQuantity,
        unitPriceCents,
        totalCents,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: input.quantity,
        unitPriceCents,
        totalCents: unitPriceCents * input.quantity,
      },
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: {
      id: cart.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "asc",
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