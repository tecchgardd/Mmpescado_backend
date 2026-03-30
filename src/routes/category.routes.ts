import { Router } from "express";
import { z } from "zod";
import { categoryController } from "../controller/category.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const categoryRoutes = Router();

const createCategorySchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres."),
  slug: z.string().min(2, "Slug deve ter no mínimo 2 caracteres."),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = z
  .object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres.").optional(),
    slug: z.string().min(2, "Slug deve ter no mínimo 2 caracteres.").optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });

categoryRoutes.get("/", requireAuth, categoryController.list.bind(categoryController));
categoryRoutes.get("/all", requireAuth, categoryController.listAll.bind(categoryController));
categoryRoutes.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  validateBody(createCategorySchema),
  categoryController.create.bind(categoryController),
);
categoryRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  validateBody(updateCategorySchema),
  categoryController.update.bind(categoryController),
);
categoryRoutes.delete("/:id", requireAuth, requireRole("ADMIN"), categoryController.delete.bind(categoryController));

export default categoryRoutes;
