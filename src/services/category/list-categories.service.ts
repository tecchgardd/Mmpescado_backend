import { prisma } from "../../database/prisma.js";

export async function listCategoriesService() {
  try {
    return await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            priceCents: true,
            imageUrl: true,
            inventory: {
              select: {
                quantity: true,
              }
            }

          }
        },
      },
    });
  } catch {
    throw {
      status: 500,
      message: "Erro ao listar categorias.",
    };
  }
}
