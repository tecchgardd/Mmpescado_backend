import { authPaths } from "./paths/auth.paths.js";
import { userPaths } from "./paths/user.paths.js";
import { customerPaths } from "./paths/customer.paths.js";
import { productPaths } from "./paths/product.paths.js";
import { categoryPaths } from "./paths/category.paths.js";
import { orderPaths } from "./paths/order.paths.js";
import { inventoryPaths } from "./paths/inventory.paths.js";
import { paymentPaths } from "./paths/payment.paths.js";

export const openapi = {
  openapi: "3.0.0",

  info: {
    title: "MM Pescado API",
    version: "1.0.0",
    description: "API do sistema de e-commerce MM Pescado",
  },

  servers: [
    {
      url: "http://localhost:3000/api",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },

paths: {
  ...authPaths,
  ...userPaths,
  ...customerPaths,
  ...productPaths,
  ...categoryPaths,
  ...orderPaths,
  ...inventoryPaths,
  ...paymentPaths,
},
};