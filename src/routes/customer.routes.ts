import { Router } from "express";
import { z } from "zod";
import { customerController } from "../controller/customer.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const customerRoutes = Router();

const updateCustomerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres.").optional(),
    email: z.string().email("E-mail inválido.").nullable().optional(),
    phone: z.string().nullable().optional(),
    document: z.string().min(11, "Documento inválido.").optional(),
    street: z.string().min(2, "Rua inválida.").optional(),
    number: z.string().min(1, "Número inválido.").optional(),
    district: z.string().min(2, "Bairro inválido.").optional(),
    city: z.string().min(2, "Cidade inválida.").optional(),
    state: z.string().min(2, "Estado inválido.").max(2, "Use a UF com 2 letras.").optional(),
    zipCode: z.string().min(8, "CEP inválido.").optional(),
    complement: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });

customerRoutes.get("/me", requireAuth, requireRole("USER", "ADMIN", "STAFF"), customerController.getMe.bind(customerController));
customerRoutes.patch(
  "/me",
  requireAuth,
  requireRole("USER", "ADMIN", "STAFF"),
  validateBody(updateCustomerSchema),
  customerController.updateMe.bind(customerController),
);

customerRoutes.get("/", requireAuth, requireRole("ADMIN", "STAFF"), customerController.list.bind(customerController));
customerRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  validateBody(updateCustomerSchema),
  customerController.update.bind(customerController),
);
customerRoutes.delete("/:id", requireAuth, requireRole("ADMIN"), customerController.delete.bind(customerController));

export default customerRoutes;
