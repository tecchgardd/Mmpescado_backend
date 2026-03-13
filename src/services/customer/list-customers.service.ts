import { prisma } from "../../database/prisma.js";

export type ListCustomersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function listCustomersService(params: ListCustomersParams) {
  try {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const where = params.search
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
            {
              document: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : undefined;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
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
      message: "Erro ao listar clientes.",
    };
  }
}
