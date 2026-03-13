export const customerPaths = {
  "/customers": {
    get: {
      tags: ["Customers"],
      summary: "Listar clientes",
      description: "Retorna a lista de clientes cadastrados.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Lista de clientes retornada com sucesso.",
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

  "/customers/{id}": {
    get: {
      tags: ["Customers"],
      summary: "Buscar cliente por ID",
      description: "Retorna os dados de um cliente específico.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID do cliente.",
        },
      ],
      responses: {
        200: {
          description: "Cliente encontrado com sucesso.",
        },
        401: {
          description: "Não autenticado.",
        },
        403: {
          description: "Acesso negado.",
        },
        404: {
          description: "Cliente não encontrado.",
        },
      },
    },

    patch: {
      tags: ["Customers"],
      summary: "Atualizar cliente",
      description: "Atualiza os dados de um cliente.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID do cliente.",
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
                  example: "João da Silva",
                },
                email: {
                  type: "string",
                  example: "joao@email.com",
                },
                phone: {
                  type: "string",
                  example: "48999999999",
                },
                document: {
                  type: "string",
                  example: "12345678900",
                },
                street: {
                  type: "string",
                  example: "Rua das Flores",
                },
                number: {
                  type: "string",
                  example: "123",
                },
                district: {
                  type: "string",
                  example: "Centro",
                },
                city: {
                  type: "string",
                  example: "Florianópolis",
                },
                state: {
                  type: "string",
                  example: "SC",
                },
                zipCode: {
                  type: "string",
                  example: "88000-000",
                },
                complement: {
                  type: "string",
                  example: "Apartamento 202",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Cliente atualizado com sucesso.",
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
          description: "Cliente não encontrado.",
        },
      },
    },

    delete: {
      tags: ["Customers"],
      summary: "Deletar cliente",
      description: "Remove um cliente do sistema.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID do cliente.",
        },
      ],
      responses: {
        200: {
          description: "Cliente deletado com sucesso.",
        },
        401: {
          description: "Não autenticado.",
        },
        403: {
          description: "Acesso negado.",
        },
        404: {
          description: "Cliente não encontrado.",
        },
      },
    },
  },
};