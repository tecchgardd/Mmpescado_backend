export const paymentPaths = {
  "/payments/checkout/{orderId}": {
    post: {
      tags: ["Payments"],
      summary: "Criar checkout AbacatePay para um pedido",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        201: {
          description: "Checkout criado com sucesso.",
        },
      },
    },
  },

  "/payments/order/{orderId}": {
    get: {
      tags: ["Payments"],
      summary: "Buscar pagamento por pedido",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Pagamento retornado com sucesso.",
        },
      },
    },
  },

  "/webhooks/abacatepay": {
    post: {
      tags: ["Webhooks"],
      summary: "Webhook da AbacatePay",
      parameters: [
        {
          name: "webhookSecret",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Webhook processado com sucesso.",
        },
      },
    },
  },
};