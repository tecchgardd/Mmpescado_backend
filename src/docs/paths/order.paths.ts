export const orderPaths = {
  "/orders": {
    get: {
      tags: ["Orders"],
      summary: "Listar pedidos",
      security: [{ bearerAuth: [] }],
    },

    post: {
      tags: ["Orders"],
      summary: "Criar pedido",
      security: [{ bearerAuth: [] }],
    },
  },

  "/orders/{id}": {
    get: {
      tags: ["Orders"],
      summary: "Buscar pedido por id",
      security: [{ bearerAuth: [] }],
    },

    delete: {
      tags: ["Orders"],
      summary: "Deletar pedido",
      security: [{ bearerAuth: [] }],
    },
  },

  "/orders/{id}/status": {
    patch: {
      tags: ["Orders"],
      summary: "Atualizar status do pedido",
      security: [{ bearerAuth: [] }],
    },
  },
};