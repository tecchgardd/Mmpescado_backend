import { prisma } from "../../database/prisma.js";

export type ListUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "STAFF" | "USER";
};

export async function listUsersService(params: ListUsersParams) {
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
      ...(params.role ? { role: params.role } : {}),
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
