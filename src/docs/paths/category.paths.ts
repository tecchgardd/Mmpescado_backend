export const categoryPaths = {
  "/categories": {
    get: {
      tags: ["Categories"],
      summary: "Listar categorias",
      description: "Retorna a lista de categorias cadastradas.",
      responses: {
        200: {
          description: "Lista de categorias retornada com sucesso.",
        },
      },
    },

    post: {
      tags: ["Categories"],
      summary: "Criar categoria",
      description: "Cria uma nova categoria.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "slug"],
              properties: {
                name: {
                  type: "string",
                  example: "Peixes",
                },
                slug: {
                  type: "string",
                  example: "peixes",
                },
                isActive: {
                  type: "boolean",
                  example: true,
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Categoria criada com sucesso.",
        },
        400: {
          description: "Dados inválidos.",
        },
        401: {
          description: "Não autenticado.",
        },
        403: {
          description: "Acesso negado.",
        },
      },
    },
  },

  "/categories/{id}": {
    get: {
      tags: ["Categories"],
      summary: "Buscar categoria por ID",
      description: "Retorna os dados de uma categoria específica.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID da categoria.",
        },
      ],
      responses: {
        200: {
          description: "Categoria encontrada com sucesso.",
        },
        404: {
          description: "Categoria não encontrada.",
        },
      },
    },

    patch: {
      tags: ["Categories"],
      summary: "Atualizar categoria",
      description: "Atualiza os dados de uma categoria.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID da categoria.",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "Frutos do Mar",
                },
                slug: {
                  type: "string",
                  example: "frutos-do-mar",
                },
                isActive: {
                  type: "boolean",
                  example: true,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Categoria atualizada com sucesso.",
        },
        400: {
          description: "Dados inválidos.",
        },
        401: {
          description: "Não autenticado.",
        },
        403: {
          description: "Acesso negado.",
        },
        404: {
          description: "Categoria não encontrada.",
        },
      },
    },

    delete: {
      tags: ["Categories"],
      summary: "Deletar categoria",
      description: "Remove uma categoria do sistema.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID da categoria.",
        },
      ],
      responses: {
        200: {
          description: "Categoria deletada com sucesso.",
        },
        401: {
          description: "Não autenticado.",
        },
        403: {
          description: "Acesso negado.",
        },
        404: {
          description: "Categoria não encontrada.",
        },
      },
    },
  },
};