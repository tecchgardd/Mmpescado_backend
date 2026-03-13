import { prisma } from "../../database/prisma.js";

function generateOrderCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `MM-${year}${month}${day}-${random}`;
}

type CreateOrderInput = {
  userId: string;
  discountCents?: number;
  shippingCents?: number;
};

export async function createOrderService(
  input: CreateOrderInput,
) {
  const discountCents = input.discountCents ?? 0;
  const shippingCents = input.shippingCents ?? 0;

  const customer = await prisma.customer.findUnique({
    where: {
      userId: input.userId,
    },
    include: {
      cart: {
        include: {
          items: {
            include: {
              product: {
                include: {
                  inventory: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  if (!customer) {
    throw {
      status: 404,
      message: "Customer não encontrado para este usuário.",
    };
  }

  if (!customer.cart) {
    throw {
      status: 404,
      message: "Carrinho não encontrado.",
    };
  }

  if (!customer.cart.items.length) {
    throw {
      status: 400,
      message: "O carrinho está vazio.",
    };
  }

  let subtotalCents = 0;

  const itemsData = customer.cart.items.map((cartItem) => {
    const product = cartItem.product;

    if (!product) {
      throw {
        status: 404,
        message: "Produto do carrinho não encontrado.",
      };
    }

    if (!product.isActive) {
      throw {
        status: 400,
        message: `O produto ${product.name} está inativo.`,
      };
    }

    if (!product.inventory) {
      throw {
        status: 400,
        message: `O produto ${product.name} não possui estoque configurado.`,
      };
    }

    if (cartItem.quantity <= 0) {
      throw {
        status: 400,
        message: `Quantidade inválida para o produto ${product.name}.`,
      };
    }

    if (product.inventory.quantity < cartItem.quantity) {
      throw {
        status: 400,
        message: `Estoque insuficiente para o produto ${product.name}.`,
      };
    }

    const unitPriceCents = product.promoPriceCents ?? product.priceCents;
    const totalCents = unitPriceCents * cartItem.quantity;

    subtotalCents += totalCents;

    return {
      productId: product.id,
      quantity: cartItem.quantity,
      unitPriceCents,
      totalCents,
    };
  });

  const totalCents = subtotalCents - discountCents + shippingCents;

  if (totalCents < 0) {
    throw {
      status: 400,
      message: "O total do pedido não pode ser negativo.",
    };
  }

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        code: generateOrderCode(),
        customerId: customer.id,
        status: "PENDING",
        subtotalCents,
        discountCents,
        shippingCents,
        totalCents,
        items: {
          create: itemsData,
        },
        payments: {
          create: {
            method: "PIX",
            status: "PENDING",
            amountCents: totalCents,
            gateway: "abacatepay",
          },
        },
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

    for (const item of itemsData) {
      await tx.inventory.update({
        where: {
          productId: item.productId,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: {
        cartId: customer.cart!.id,
      },
    });

    return createdOrder;
  });

  return order;
}