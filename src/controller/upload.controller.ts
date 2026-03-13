import type { Request, Response } from "express";
import { uploadProductImageService } from "../services/upload/upload-product-image.service.js";

class UploadController {
  async uploadProductImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Arquivo não enviado.",
        });
      }

      const result: any = await uploadProductImageService(req.file.buffer);

      return res.status(200).json({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao fazer upload da imagem.",
      });
    }
  }
}

export const uploadController = new UploadController();