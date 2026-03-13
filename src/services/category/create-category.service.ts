import { prisma } from "../../database/prisma.js";

export type CreateCategoryInput = {
  name: string;
  slug: string;
  isActive?: boolean;
};

export async function createCategoryService(data: CreateCategoryInput) {
  try {
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
      },
    });

    if (existingCategory) {
      throw {
        status: 409,
        message: "Já existe categoria com este nome ou slug.",
      };
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        isActive: data.isActive ?? true,
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
      message: "Erro ao criar categoria.",
    };
  }
}
