import { Router } from "express";
import { z } from "zod";
import { userController } from "../controller/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const userRoutes = Router();

const updateUserSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres.").optional(),
    email: z.string().email("E-mail inválido.").optional(),
    role: z.enum(["ADMIN", "STAFF", "USER"]).optional(),
    isActive: z.boolean().optional(),
    image: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });

userRoutes.get("/", requireAuth, requireRole("ADMIN"), userController.list.bind(userController));
userRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateBody(updateUserSchema),
  userController.update.bind(userController),
);
userRoutes.delete("/:id", requireAuth, requireRole("ADMIN"), userController.delete.bind(userController));

export default userRoutes;
