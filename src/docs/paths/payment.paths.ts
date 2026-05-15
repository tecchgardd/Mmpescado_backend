export const paymentPaths = {
  "/payments/checkout/{orderId}": {
    post: {
      tags: ["Payments"],
      summary: "Criar link de pagamento via WhatsApp para um pedido",
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

};