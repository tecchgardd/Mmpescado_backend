import { prisma } from "../../database/prisma.js";

export async function deleteUserService(id: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!existingUser) {
      throw {
        status: 404,
        message: "Usuário não encontrado.",
      };
    }

    await prisma.$transaction(async (tx) => {
      if (existingUser.customer) {
        await tx.customer.update({
          where: { id: existingUser.customer.id },
          data: {
            userId: null,
          },
        });
      }

      await tx.session.deleteMany({
        where: {
          userId: id,
        },
      });

      await tx.account.deleteMany({
        where: {
          userId: id,
        },
      });

      await tx.user.delete({
        where: {
          id,
        },
      });
    });

    return {
      message: "Usuário deletado com sucesso.",
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
      message: "Erro ao deletar usuário.",
    };
  }
}
