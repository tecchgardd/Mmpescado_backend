import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import { createAbacateBilling } from "../../integrations/abacatepay.js";
import { ensureCustomerForUserService } from "../customer/ensure-customer-for-user.service.js";

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
  paymentMethod?: string;
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    taxId?: string;
  };
  delivery?: {
    type?: string;
    zipCode?: string;
    address?: string;
    number?: string;
    complement?: string;
  };
  notes?: string;
};

export async function createOrderService(input: CreateOrderInput) {
  const discountCents = input.discountCents ?? 0;
  const shippingCents = input.shippingCents ?? 0;
  const paymentMethod = input.paymentMethod ?? "PIX";

  const ensuredCustomer = await ensureCustomerForUserService(input.userId);

  const customer = await prisma.customer.findUnique({
    where: { id: ensuredCustomer.id },
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
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!customer) {
    throw { status: 404, message: "Cliente não encontrado." };
  }

  if (!customer.cart) {
    throw { status: 404, message: "Carrinho não encontrado." };
  }

  if (!customer.cart.items.length) {
    throw { status: 400, message: "O carrinho está vazio." };
  }

  let subtotalCents = 0;

  const itemsData = customer.cart.items.map((cartItem) => {
    const product = cartItem.product;

    if (!product) {
      throw { status: 404, message: "Produto não encontrado." };
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
        message: `O produto ${product.name} não possui estoque.`,
      };
    }

    if (product.inventory.quantity < cartItem.quantity) {
      throw {
        status: 400,
        message: `Estoque insuficiente para ${product.name}.`,
      };
    }

    const unitPriceCents =
      (product.promoPriceCents ?? 0) > product.priceCents
        ? product.priceCents
        : (product.promoPriceCents ?? product.priceCents);

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

  if (totalCents <= 0) {
    throw { status: 400, message: "Total do pedido inválido." };
  }

  const orderCode = generateOrderCode();
  let checkout: any = null;

  if (paymentMethod === "ABACATEPAY") {
    try {
      const billingProducts = customer.cart.items.map((cartItem) => {
        const product = cartItem.product;
        const price =
          (product.promoPriceCents ?? 0) > product.priceCents
            ? product.priceCents
            : (product.promoPriceCents ?? product.priceCents);
        return {
          externalId: product.id,
          name: product.name,
          description: (product as any).description ?? product.name,
          quantity: cartItem.quantity,
          price,
        };
      });

      const contactEmail = input.contact?.email || customer.email;
      const inlineCustomer = contactEmail
        ? {
            email: contactEmail,
            name: input.contact?.name || customer.name,
            cellphone: input.contact?.phone || customer.phone,
            taxId: input.contact?.taxId || customer.document,
          }
        : undefined;

      checkout = await createAbacateBilling({
        products: billingProducts,
        externalId: String(orderCode),
        returnUrl:
          process.env.ABACATEPAY_RETURN_URL || process.env.FRONTEND_URL,
        completionUrl:
          process.env.ABACATEPAY_COMPLETION_URL ||
          `${process.env.FRONTEND_URL || ""}/loja/pedidos`,
        customer: inlineCustomer,
        metadata: { orderCode },
      });
    } catch (error: any) {
      console.error(
        "Erro AbacatePay:",
        error?.response?.data || error?.message || error,
      );

      throw {
        status: error?.status || error?.response?.status || 400,
        message:
          error?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Falha ao gerar checkout no AbacatePay.",
      };
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        code: orderCode,
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
            gateway: paymentMethod === "ABACATEPAY" ? "abacatepay" : "manual",
            gatewayPaymentId: checkout?.id ?? null,
            externalId: String(orderCode),
            checkoutUrl: checkout?.url ?? null,
            rawResponse: (checkout ?? null) as Prisma.InputJsonValue,
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
        where: { productId: item.productId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: { cartId: customer.cart!.id },
    });

    return createdOrder;
  });

  const redirectUrl = checkout?.url ?? order.payments?.[0]?.checkoutUrl ?? null;

  return {
    order,
    payment: order.payments?.[0] ?? null,
    redirectUrl,
    checkoutUrl: redirectUrl,
  };
}
