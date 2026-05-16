import { prisma } from "../../database/prisma.js";
import { ensureCustomerForUserService } from "../customer/ensure-customer-for-user.service.js";
import { getWhatsAppUrl } from "../../utils/whatsapp.js";

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

  // Mapeia os valores do frontend para o enum do banco
  const paymentMethodMap: Record<string, string> = {
    Pix: "PIX",
    PIX: "PIX",
    Cartão: "CREDIT_CARD",
    Cartao: "CREDIT_CARD",
    CREDIT_CARD: "CREDIT_CARD",
    DEBIT_CARD: "DEBIT_CARD",
    Dinheiro: "CASH",
    CASH: "CASH",
  };
  const rawMethod = input.paymentMethod ?? "PIX";
  const paymentMethod = paymentMethodMap[rawMethod] ?? "PIX";

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

  const itemsData = customer.cart.items.map((cartItem: any) => {
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
  const whatsappUrl = getWhatsAppUrl({
    orderCode,
    totalCents,
  });

  const order = await prisma.$transaction(async (tx: any) => {
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
            method: paymentMethod as any,
            status: "PENDING",
            amountCents: totalCents,
            gateway: "manual",
            gatewayPaymentId: null,
            externalId: String(orderCode),
            checkoutUrl: whatsappUrl,
            rawResponse: {
              type: "whatsapp",
              url: whatsappUrl,
            } as any,
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

  const redirectUrl = order.payments?.[0]?.checkoutUrl ?? null;

  return {
    order,
    payment: order.payments?.[0] ?? null,
    redirectUrl,
    checkoutUrl: redirectUrl,
  };
}
