import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { productController } from "../controller/product.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

function parseProductJson(req: Request, res: Response, next: NextFunction) {
  if (req.body?.product) {
    try {
      req.body = JSON.parse(req.body.product);
    } catch {
      return res.status(400).json({ message: "Campo 'product' deve ser um JSON válido." });
    }
  }
  return next();
}

const productRoutes = Router();

const createProductSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres."),
  slug: z.string().min(2, "Slug deve ter no mínimo 2 caracteres."),
  description: z.string().nullable().optional(),
  priceCents: z.number().int().min(0, "Preço inválido."),
  promoPriceCents: z.number().int().min(0, "Preço promocional inválido.").nullable().optional(),
  unitLabel: z.string().min(1, "Unidade inválida.").optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().min(1, "Categoria obrigatória."),
  quantity: z.number().int().min(0).optional(),
  minQuantity: z.number().int().min(0).optional(),
});

const updateProductSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres.").optional(),
    slug: z.string().min(2, "Slug deve ter no mínimo 2 caracteres.").optional(),
    description: z.string().nullable().optional(),
    imageUrl: z.string().url("URL da imagem inválida.").nullable().optional(),
    priceCents: z.number().int().min(0, "Preço inválido.").optional(),
    promoPriceCents: z.number().int().min(0, "Preço promocional inválido.").nullable().optional(),
    unitLabel: z.string().min(1, "Unidade inválida.").optional(),
    isActive: z.boolean().optional(),
    categoryId: z.string().min(1, "Categoria inválida.").optional(),
    quantity: z.number().int().min(0).optional(),
    minQuantity: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });

productRoutes.get("/", requireAuth, requireRole("ADMIN", "STAFF"), productController.list.bind(productController));
productRoutes.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  upload.single("image"),
  parseProductJson,
  validateBody(createProductSchema),
  productController.create.bind(productController),
);
productRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  validateBody(updateProductSchema),
  productController.update.bind(productController),
);
productRoutes.delete("/:id", requireAuth, requireRole("ADMIN"), productController.delete.bind(productController));

export default productRoutes;
