import { prisma } from "../database/prisma.js";

type ListUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "STAFF" | "USER";
};

type UpdateUserInput = {
  name?: string;
  email?: string;
  role?: "ADMIN" | "STAFF" | "USER";
  isActive?: boolean;
  image?: string | null;
};

class UserService {
  async listUsers(params: ListUsersParams) {
    try {
      const page = params.page && params.page > 0 ? params.page : 1;
      const limit = params.limit && params.limit > 0 ? params.limit : 10;
      const skip = (page - 1) * limit;

      const where = {
        ...(params.search
          ? {
              OR: [
                {
                  name: {
                    contains: params.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  email: {
                    contains: params.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
        ...(params.role
          ? {
              role: params.role,
            }
          : {}),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
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
            customer: {
              select: {
                id: true,
                phone: true,
                document: true,
                city: true,
                state: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch {
      throw {
        status: 500,
        message: "Erro ao listar usuários.",
      };
    }
  }

  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
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

  async updateUser(id: string, data: UpdateUserInput) {
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

  async deleteUser(id: string) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: {
          customer: true,
          sessions: true,
          accounts: true,
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
}

export const userService = new UserService();