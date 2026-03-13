type PaginationInput = {
  page?: number | string;
  limit?: number | string;
};

export function getPagination(input: PaginationInput) {
  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(input.limit) || 10));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

type MetaInput = {
  page: number;
  limit: number;
  total: number;
};

export function buildPaginationMeta({ page, limit, total }: MetaInput) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}