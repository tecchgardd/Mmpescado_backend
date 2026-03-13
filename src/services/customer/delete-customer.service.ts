import { prisma } from "../../database/prisma.js";

export async function deleteCustomerService(id: string) {
  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!existingCustomer) {
      throw {
        status: 404,
        message: "Cliente não encontrado.",
      };
    }

    if (existingCustomer._count.orders > 0) {
      throw {
        status: 409,
        message: "Não é possível deletar cliente com pedidos vinculados.",
      };
    }

    await prisma.customer.delete({
      where: { id },
    });

    return {
      message: "Cliente deletado com sucesso.",
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
      message: "Erro ao deletar cliente.",
    };
  }
}
