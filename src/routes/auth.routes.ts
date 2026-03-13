import { Router } from "express";
import { z } from "zod";
import { authController } from "../controller/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const authBusinessRoutes = Router();

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres."),
  email: z.string().email("E-mail inválido."),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres.")
    .max(128, "Senha deve ter no máximo 128 caracteres."),
  phone: z.string().optional(),
});

const createAdminStaffSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres."),
  email: z.string().email("E-mail inválido."),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres.")
    .max(128, "Senha deve ter no máximo 128 caracteres."),
  role: z.enum(["ADMIN", "STAFF"]),
});

authBusinessRoutes.post(
  "/register",
  validateBody(registerSchema),
  authController.register.bind(authController),
);

authBusinessRoutes.get(
  "/me",
  requireAuth,
  authController.me.bind(authController),
);

authBusinessRoutes.post(
  "/admin/users",
  requireAuth,
  requireRole("ADMIN"),
  validateBody(createAdminStaffSchema),
  authController.createAdminOrStaff.bind(authController),
);

export default authBusinessRoutes;