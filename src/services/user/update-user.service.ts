import { prisma } from "../../database/prisma.js";

export type UpdateUserInput = {
  name?: string;
  email?: string;
  role?: "ADMIN" | "STAFF" | "USER";
  isActive?: boolean;
  image?: string | null;
};

export async function updateUserService(id: string, data: UpdateUserInput) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw {
        status: 404,
        message: "Usuário não encontrado.",
      };
    }

    if (data.email && data.email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailInUse) {
        throw {
          status: 409,
          message: "Já existe usuário com este e-mail.",
        };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.image !== undefined ? { image: data.image } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        customer: true,
      },
    });

    return updatedUser;
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
      message: "Erro ao atualizar usuário.",
    };
  }
}
