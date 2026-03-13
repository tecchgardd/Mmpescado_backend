import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadController } from "../controller/upload.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/product-image",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  upload.single("image"),
  uploadController.uploadProductImage.bind(uploadController),
);

export default router;