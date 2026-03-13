import { auth } from "../../utils/auth.js";
import { prisma } from "../../database/prisma.js";

type CreateAdminInput = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "STAFF";
};

export async function createAdminService(data: CreateAdminInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw {
      status: 409,
      message: "Já existe usuário com este e-mail",
    };
  }

  await auth.api.signUpEmail({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
    },
  });

  const user = await prisma.user.update({
    where: { email: data.email },
    data: {
      role: data.role,
    },
  });

  return user;
}