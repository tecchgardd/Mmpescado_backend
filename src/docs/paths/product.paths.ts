export const productPaths = {
  "/products": {
    get: {
      tags: ["Products"],
      summary: "Listar produtos",
      responses: {
        200: {
          description: "Lista de produtos",
        },
      },
    },

    post: {
      tags: ["Products"],
      summary: "Criar produto",
      security: [{ bearerAuth: [] }],

      responses: {
        201: {
          description: "Produto criado",
        },
      },
    },
  },

  "/products/{id}": {
    patch: {
      tags: ["Products"],
      summary: "Atualizar produto",
      security: [{ bearerAuth: [] }],

      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
    },

    delete: {
      tags: ["Products"],
      summary: "Deletar produto",
      security: [{ bearerAuth: [] }],
    },
  },
};