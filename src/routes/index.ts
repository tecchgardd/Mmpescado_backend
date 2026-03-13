import { Router } from "express";
import authBusinessRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import customerRoutes from "./customer.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import orderRoutes from "./order.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import paymentRoutes from "./payment.routes.js";
import cartRoutes from "./cart.routes.js";
import uploadRoutes from "./upload.routes.js";
const routes = Router();

routes.use("/account", authBusinessRoutes);
routes.use("/users", userRoutes);
routes.use("/customers", customerRoutes);
routes.use("/products", productRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/orders", orderRoutes);
routes.use("/inventory", inventoryRoutes);
routes.use("/payments", paymentRoutes);
routes.use("/cart", cartRoutes);
routes.use("/upload", uploadRoutes);

export default routes;