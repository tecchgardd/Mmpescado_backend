export const userPaths = {
  "/users": {
    get: {
      tags: ["Users"],
      summary: "Listar usuários",
      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: "Lista de usuários",
        },
      },
    },
  },

  "/users/{id}": {
    patch: {
      tags: ["Users"],
      summary: "Atualizar usuário",
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

      responses: {
        200: {
          description: "Usuário atualizado",
        },
      },
    },

    delete: {
      tags: ["Users"],
      summary: "Deletar usuário",
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

      responses: {
        200: {
          description: "Usuário deletado",
        },
      },
    },
  },
};