export const inventoryPaths = {
  "/inventory": {
    get: {
      tags: ["Inventory"],
      summary: "Listar estoque",
      security: [{ bearerAuth: [] }],
    },
  },

  "/inventory/product/{productId}": {
    get: {
      tags: ["Inventory"],
      summary: "Estoque por produto",
      security: [{ bearerAuth: [] }],
    },

    patch: {
      tags: ["Inventory"],
      summary: "Atualizar estoque",
      security: [{ bearerAuth: [] }],
    },
  },
};