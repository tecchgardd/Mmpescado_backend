export async function createAbacateProduct(input: {
  externalId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
}) {
  return {
    id: "mock-abacatepay-product-id",
    ...input,
  };
}
