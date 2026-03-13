import { prisma } from "../../database/prisma.js";

type ListInventoryInput = {
  page?: number;
  limit?: number;
  lowStock?: boolean;
  search?: string;
};

export async function listInventoryService(params: ListInventoryInput) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;

  const where = {
    ...(params.search
      ? {
          product: {
            OR: [
              {
                name: {
                  contains: params.search,
                  mode: "insensitive" as const,
                },
              },
              {
                slug: {
                  contains: params.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          },
        }
      : {}),
  };

  const inventory = await prisma.inventory.findMany({
    where,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  const filteredInventory = params.lowStock
    ? inventory.filter((item) => item.quantity <= item.minQuantity)
    : inventory;

  const total = filteredInventory.length;
  const skip = (page - 1) * limit;
  const paginatedInventory = filteredInventory.slice(skip, skip + limit);

  return {
    data: paginatedInventory,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
