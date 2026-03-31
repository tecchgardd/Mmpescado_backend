import { prisma } from "../../database/prisma.js";

export async function ensureCustomerForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  let customer = await prisma.customer.findUnique({
    where: { userId },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        userId: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
      },
    });
  }

  return customer;
}