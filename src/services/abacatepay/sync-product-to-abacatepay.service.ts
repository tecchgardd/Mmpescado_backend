import { prisma } from "../../database/prisma.js";
import { createAbacateProduct } from "../payment/abacatepay-client.js";

type SyncProductInput = {
  productId: string;
  forceResync?: boolean;
};

export async function syncProductToAbacatePayService({
  productId,
  forceResync = false,
}: SyncProductInput) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw {
      status: 404,
      message: "Produto não encontrado para sincronização com a AbacatePay.",
    };
  }

  if (!forceResync && product.abacatePayProductId) {
    return {
      product,
      abacatePayProductId: product.abacatePayProductId,
      synced: false,
    };
  }

  const price = product.promoPriceCents ?? product.priceCents;

  if (!price || price <= 0) {
    throw {
      status: 400,
      message: "Produto com preço inválido para sincronização com a AbacatePay.",
    };
  }

  const remoteProduct = await createAbacateProduct({
    externalId: product.id,
    name: product.name,
    description: product.description ?? product.name,
    price,
    imageUrl: product.imageUrl,
  });

  const updatedProduct = await prisma.product.update({
    where: { id: product.id },
    data: {
      abacatePayProductId: remoteProduct.id,
      abacatePaySyncedAt: new Date(),
    },
  });

  return {
    product: updatedProduct,
    abacatePayProductId: updatedProduct.abacatePayProductId,
    synced: true,
    remoteProduct,
  };
}
