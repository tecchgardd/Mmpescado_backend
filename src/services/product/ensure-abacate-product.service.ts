import { prisma } from "../../database/prisma.js";
import { createAbacateProduct } from "../../integrations/abacatepay.js";

export async function ensureAbacateProductService(productId: string, forceResync = false) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw {
      status: 404,
      message: "Produto não encontrado.",
    };
  }

  if (!forceResync && product.abacatePayProductId) {
    return product.abacatePayProductId;
  }

  const created = await createAbacateProduct({
    name: product.name,
    description: product.description ?? product.name,
    price: product.promoPriceCents ?? product.priceCents,
  });

  const abacateId = created?.id;

  if (!abacateId) {
    throw {
      status: 500,
      message: "Produto criado na AbacatePay sem ID retornado.",
    };
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      abacatePayProductId: abacateId,
      abacatePaySyncedAt: new Date(),
    },
  });

  return updated.abacatePayProductId!;
}
