import { prisma } from "../../database/prisma.js";

export type UpdateProductInput = {
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents?: number;
  promoPriceCents?: number | null;
  unitLabel?: string;
  isActive?: boolean;
  categoryId?: string;
  quantity?: number;
  minQuantity?: number;
};

export async function updateProductService(id: string, data: UpdateProductInput) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        inventory: true,
      },
    });

    if (!existingProduct) {
      throw {
        status: 404,
        message: "Produto não encontrado.",
      };
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id: data.categoryId,
        },
      });

      if (!category) {
        throw {
          status: 404,
          message: "Categoria não encontrada.",
        };
      }
    }

    if ((data.name && data.name !== existingProduct.name) || (data.slug && data.slug !== existingProduct.slug)) {
      const duplicated = await prisma.product.findFirst({
        where: {
          OR: [
            ...(data.name ? [{ name: data.name }] : []),
            ...(data.slug ? [{ slug: data.slug }] : []),
          ],
          NOT: { id },
        },
      });

      if (duplicated) {
        throw {
          status: 409,
          message: "Já existe produto com este nome ou slug.",
        };
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.slug !== undefined ? { slug: data.slug } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
          ...(data.priceCents !== undefined ? { priceCents: data.priceCents } : {}),
          ...(data.promoPriceCents !== undefined ? { promoPriceCents: data.promoPriceCents } : {}),
          ...(data.unitLabel !== undefined ? { unitLabel: data.unitLabel } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        },
      });

      if (data.quantity !== undefined || data.minQuantity !== undefined) {
        if (existingProduct.inventory) {
          await tx.inventory.update({
            where: {
              productId: id,
            },
            data: {
              ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
              ...(data.minQuantity !== undefined ? { minQuantity: data.minQuantity } : {}),
            },
          });
        } else {
          await tx.inventory.create({
            data: {
              productId: id,
              quantity: data.quantity ?? 0,
              minQuantity: data.minQuantity ?? 0,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id: updatedProduct.id },
        include: {
          category: true,
          inventory: true,
        },
      });
    });

    return product;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      "message" in error
    ) {
      throw error;
    }

    throw {
      status: 500,
      message: "Erro ao atualizar produto.",
    };
  }
}
