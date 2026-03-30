import { prisma } from "../../database/prisma.js";

export async function listAllCategoriesService() {
  try {
    return await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      }
    });
  } catch {
    throw {
      status: 500,
      message: "Erro ao listar todas categorias.",
    };
  }
}
