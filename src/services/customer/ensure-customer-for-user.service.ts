import { prisma } from "../../database/prisma.js";

export async function ensureCustomerForUserService(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      customer: true,
    },
  });

  if (!user) {
    throw {
      status: 404,
      message: "Usuário não encontrado.",
    };
  }

  if (user.customer) {
    return user.customer;
  }

  const existingEmailCustomer = user.email
    ? await prisma.customer.findFirst({
        where: {
          email: user.email,
          userId: null,
        },
      })
    : null;

  if (existingEmailCustomer) {
    return prisma.customer.update({
      where: {
        id: existingEmailCustomer.id,
      },
      data: {
        userId: user.id,
        name: existingEmailCustomer.name || user.name,
        email: existingEmailCustomer.email ?? user.email,
      },
    });
  }

  return prisma.customer.create({
    data: {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: null,
      document: null,
      street: null,
      number: null,
      district: null,
      city: null,
      state: null,
      zipCode: null,
      complement: null,
    },
  });
}
