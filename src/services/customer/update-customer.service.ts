import { prisma } from "../../database/prisma.js";

export type UpdateCustomerInput = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  document?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  complement?: string | null;
};

export async function updateCustomerService(id: string, data: UpdateCustomerInput) {
  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw {
        status: 404,
        message: "Cliente não encontrado.",
      };
    }

    if (data.document && data.document !== existingCustomer.document) {
      const documentInUse = await prisma.customer.findUnique({
        where: { document: data.document },
      });

      if (documentInUse) {
        throw {
          status: 409,
          message: "Já existe cliente com este documento.",
        };
      }
    }

    if (
      data.email &&
      existingCustomer.email !== data.email
    ) {
      const emailInUse = await prisma.customer.findFirst({
        where: {
          email: data.email,
          NOT: {
            id,
          },
        },
      });

      if (emailInUse) {
        throw {
          status: 409,
          message: "Já existe cliente com este e-mail.",
        };
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.document !== undefined ? { document: data.document } : {}),
        ...(data.street !== undefined ? { street: data.street } : {}),
        ...(data.number !== undefined ? { number: data.number } : {}),
        ...(data.district !== undefined ? { district: data.district } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.state !== undefined ? { state: data.state } : {}),
        ...(data.zipCode !== undefined ? { zipCode: data.zipCode } : {}),
        ...(data.complement !== undefined ? { complement: data.complement } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return customer;
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
      message: "Erro ao atualizar cliente.",
    };
  }
}
