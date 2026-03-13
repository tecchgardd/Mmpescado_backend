import { prisma } from "../../database/prisma.js";

export async function getOrCreateCartService(customerId: string) {
  let cart = await prisma.cart.findUnique({
    where: {
      customerId,
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

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        customerId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  return cart;
}