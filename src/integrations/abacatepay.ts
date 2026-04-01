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
  customerId?: string;
  metadata?: Record<string, unknown>;
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

type AbacateBillingProduct = {
  externalId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
};

type AbacateBillingInput = {
  products: AbacateBillingProduct[];
  returnUrl?: string;
  completionUrl?: string;
  customerId?: string;
  customer?: {
    name?: string | null;
    cellphone?: string | null;
    email: string;
    taxId?: string | null;
  };
  externalId?: string;
  metadata?: Record<string, unknown>;
};

export async function createAbacateBilling(input: AbacateBillingInput) {
  try {
    if (!input.products || !input.products.length) {
      throw {
        status: 400,
        message: "Nenhum produto informado para criar o billing.",
      };
    }

    const body: Record<string, unknown> = {
      frequency: "ONE_TIME",
      methods: ["PIX", "CARD"],
      products: input.products,
    };

    if (input.externalId) body.externalId = String(input.externalId);
    if (input.returnUrl) body.returnUrl = input.returnUrl;
    if (input.completionUrl) body.completionUrl = input.completionUrl;
    if (input.customerId) body.customerId = input.customerId;
    if (input.customer) body.customer = input.customer;
    if (input.metadata) body.metadata = input.metadata;

    console.log("Payload billing AbacatePay:", JSON.stringify(body, null, 2));

    const response = await axios.post(
      "https://api.abacatepay.com/v1/billing/create",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiToken()}`,
        },
      },
    );

    console.log(
      "Resposta billing AbacatePay:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      "Erro AbacatePay create billing:",
      error?.response?.status,
      error?.response?.data || error?.message || error,
    );

    throw {
      status: error?.response?.status || 400,
      message:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Falha ao gerar billing no AbacatePay.",
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
    if (input.customerId) body.customerId = input.customerId;
    if (input.metadata) body.metadata = input.metadata;

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