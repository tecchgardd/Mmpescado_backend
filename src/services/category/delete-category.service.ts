import { prisma } from "../../database/prisma.js";

export async function deleteCategoryService(id: string) {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingCategory) {
      throw {
        status: 404,
        message: "Categoria não encontrada.",
      };
    }

    if (existingCategory._count.products > 0) {
      throw {
        status: 409,
        message: "Não é possível deletar categoria com produtos vinculados.",
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    return {
      message: "Categoria deletada com sucesso.",
    };
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
      message: "Erro ao deletar categoria.",
    };
  }
}
