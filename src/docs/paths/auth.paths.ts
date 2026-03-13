export const authPaths = {
  "/account/register": {
    post: {
      tags: ["Auth"],
      summary: "Cadastrar usuário",

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
              },
            },
          },
        },
      },

      responses: {
        201: {
          description: "Usuário criado",
        },
      },
    },
  },

  "/account/me": {
    get: {
      tags: ["Auth"],
      summary: "Retorna usuário logado",
      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: "Usuário autenticado",
        },
      },
    },
  },
};