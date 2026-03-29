import { prisma } from "../../database/prisma.js";
import { cloudinary } from "../../utils/cloudinary.js";

function extractCloudinaryPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  return match ? match[1] : null;
}

export async function deleteProductService(id: string) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
        inventory: true,
      },
    });

    if (!existingProduct) {
      throw {
        status: 404,
        message: "Produto não encontrado.",
      };
    }

    if (existingProduct._count.orderItems > 0) {
      throw {
        status: 409,
        message: "Não é possível deletar produto vinculado a pedidos.",
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    if (existingProduct.imageUrl) {
      const publicId = extractCloudinaryPublicId(existingProduct.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch(() => null);
      }
    }

    return {
      message: "Produto deletado com sucesso.",
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      "message" in error
    ) {
      throw error;
    }

    throw {
      status: 500,
      message: "Erro ao deletar produto.",
    };
  }
}
