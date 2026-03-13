type AbacateItem = {
  externalId: string;
  name: string;
  price: number;
  quantity: number;
};

type CreateCheckoutPayload = {
  frequency: "ONE_TIME";
  methods: ("PIX" | "CARD")[];
  products: AbacateItem[];
  returnUrl?: string;
  completionUrl?: string;
  customer: {
    name: string;
    email: string;
    cellphone?: string;
    taxId?: string;
  };
};

export async function createAbacateCheckout(payload: CreateCheckoutPayload) {
  const response = await fetch(`${process.env.ABACATEPAY_API_URL}/billing/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ABACATEPAY_API_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data?.message ?? "Erro ao criar checkout na AbacatePay.",
      details: data,
    };
  }

  return data;
}