import { prisma } from "../../database/prisma.js";
import { ensureAbacateProductService } from "./ensure-abacate-product.service.js";

export type CreateProductInput = {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents: number;
  promoPriceCents?: number | null;
  unitLabel?: string;
  isActive?: boolean;
  categoryId: string;
  quantity?: number;
  minQuantity?: number;
};

export async function createProductService(data: CreateProductInput) {
  try {
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

    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [{ slug: data.slug }, { name: data.name }],
      },
    });

    if (existingProduct) {
      throw {
        status: 409,
        message: "Já existe produto com este nome ou slug.",
      };
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        priceCents: data.priceCents,
        promoPriceCents: data.promoPriceCents ?? null,
        unitLabel: data.unitLabel ?? "kg",
        isActive: data.isActive ?? true,
        categoryId: data.categoryId,
        inventory: {
          create: {
            quantity: data.quantity ?? 0,
            minQuantity: data.minQuantity ?? 0,
          },
        },
      },
      include: {
        category: true,
        inventory: true,
      },
    });

    try {
      await ensureAbacateProductService(product.id);
    } catch (syncError: any) {
      console.error("Erro ao sincronizar produto com AbacatePay:", syncError?.message || syncError);
    }

    return prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        inventory: true,
      },
    });
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
      message: "Erro ao criar produto.",
    };
  }
}
