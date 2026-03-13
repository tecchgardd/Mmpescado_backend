import { isAPIError } from "better-auth/api";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth.js";
import { prisma } from "../database/prisma.js";

type RegisterWithEmailInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

type CreateAdminOrStaffInput = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "STAFF";
};

class AuthService {
  async registerWithEmail(
    input: RegisterWithEmailInput,
    reqHeaders: Record<string, string | string[] | undefined>,
  ) {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
        headers: fromNodeHeaders(
          reqHeaders as Record<string, string | string[]>,
        ),
      });

      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw {
          status: 500,
          message: "Usuário criado, mas não encontrado após cadastro.",
        };
      }

      let customer = await prisma.customer.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            userId: user.id,
            name: input.name,
            email: input.email,
            phone: input.phone ?? null,
            document: `PENDENTE-${user.id}`,
            street: "Não informado",
            number: "S/N",
            district: "Não informado",
            city: "Não informado",
            state: "SC",
            zipCode: "00000-000",
            complement: null,
          },
        });
      }

      return {
        token: result?.token ?? null,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        customer,
      };
    } catch (error) {
      if (isAPIError(error)) {
        throw {
          status: error.status,
          message: error.message,
        };
      }

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
        message: "Erro ao cadastrar usuário.",
      };
    }
  }

  async getMe(userId: string) {
    try {
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

      return user;
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
        message: "Erro ao buscar usuário.",
      };
    }
  }

  async createAdminOrStaff(data: CreateAdminOrStaffInput) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (existingUser) {
        throw {
          status: 409,
          message: "Já existe usuário com este e-mail.",
        };
      }

      await auth.api.signUpEmail({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      });

      const createdUser = await prisma.user.update({
        where: {
          email: data.email,
        },
        data: {
          role: data.role,
        },
      });

      return {
        user: createdUser,
      };
    } catch (error) {
      if (isAPIError(error)) {
        throw {
          status: error.status,
          message: error.message,
        };
      }

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
        message: "Erro ao criar usuário administrativo.",
      };
    }
  }
}

export const authService = new AuthService();