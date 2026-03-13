import { prisma } from "../../database/prisma.js";

export type UpdateCategoryInput = {
  name?: string;
  slug?: string;
  isActive?: boolean;
};

export async function updateCategoryService(id: string, data: UpdateCategoryInput) {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw {
        status: 404,
        message: "Categoria não encontrada.",
      };
    }

    if ((data.name && data.name !== existingCategory.name) || (data.slug && data.slug !== existingCategory.slug)) {
      const duplicated = await prisma.category.findFirst({
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
          message: "Já existe categoria com este nome ou slug.",
        };
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    return category;
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
      message: "Erro ao atualizar categoria.",
    };
  }
}
