import axios from "axios";

type AbacateProductInput = {
  name: string;
  description?: string | null;
  price: number;
};

type AbacateCustomerInput = {
  email: string;
  name?: string | null;
  cellphone?: string | null;
  taxId?: string | null;
  zipCode?: string | null;
};

type AbacateCheckoutInput = {
  items: Array<{ id: string; quantity: number }>;
  externalId?: string;
  returnUrl?: string;
  completionUrl?: string;
};

function getApiToken() {
  const token = process.env.ABACATEPAY_TOKEN || process.env.ABACATEPAY_API_TOKEN;

  if (!token) {
    throw {
      status: 500,
      message: "ABACATEPAY_TOKEN não configurado.",
    };
  }

  return token;
}

const abacateApi = axios.create({
  baseURL: "https://api.abacatepay.com/v2",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function createAbacateProduct(input: AbacateProductInput) {
  try {
    const body: Record<string, unknown> = {
      name: input.name,
      description: input.description || input.name,
      price: input.price,
    };

    const response = await abacateApi.post("/products/create", body, {
      headers: {
        Authorization: `Bearer ${getApiToken()}`,
      },
    });

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      "Erro AbacatePay create product:",
      error?.response?.status,
      error?.response?.data || error?.message || error,
    );

    throw {
      status: error?.response?.status || 400,
      message:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Falha ao criar produto na AbacatePay.",
    };
  }
}

export async function createAbacateCustomer(input: AbacateCustomerInput) {
  try {
    const body: Record<string, unknown> = {
      email: input.email,
    };

    if (input.name) body.name = input.name;
    if (input.cellphone) body.cellphone = input.cellphone;
    if (input.taxId) body.taxId = input.taxId;
    if (input.zipCode) body.zipCode = input.zipCode;

    const response = await abacateApi.post("/customers/create", body, {
      headers: {
        Authorization: `Bearer ${getApiToken()}`,
      },
    });

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      "Erro AbacatePay create customer:",
      error?.response?.status,
      error?.response?.data || error?.message || error,
    );

    throw {
      status: error?.response?.status || 400,
      message:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Falha ao criar cliente na AbacatePay.",
    };
  }
}

export async function createAbacatePayCheckout(input: AbacateCheckoutInput) {
  try {
    if (!input.items || !input.items.length) {
      throw {
        status: 400,
        message: "Nenhum item informado para criar o checkout.",
      };
    }

    const body: Record<string, unknown> = {
      items: input.items,
      methods: ["PIX", "CARD"],
    };

    if (input.externalId) body.externalId = String(input.externalId);
    if (input.returnUrl) body.returnUrl = input.returnUrl;
    if (input.completionUrl) body.completionUrl = input.completionUrl;

    console.log("Payload checkout AbacatePay:", JSON.stringify(body, null, 2));

    const response = await abacateApi.post("/checkouts/create", body, {
      headers: {
        Authorization: `Bearer ${getApiToken()}`,
      },
    });

    console.log(
      "Resposta checkout AbacatePay:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      "Erro AbacatePay create checkout:",
      error?.response?.status,
      error?.response?.data || error?.message || error,
    );

    throw {
      status: error?.response?.status || 400,
      message:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Falha ao gerar checkout no AbacatePay.",
    };
  }
}