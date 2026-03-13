import { prisma } from "../../database/prisma.js";

export async function listCategoriesService() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return categories;
  } catch {
    throw {
      status: 500,
      message: "Erro ao listar categorias.",
    };
  }
}
