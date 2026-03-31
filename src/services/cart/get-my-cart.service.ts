import { getOrCreateCartService } from "./get-or-create-cart.service.js";
import { ensureCustomerForUserService } from "../customer/ensure-customer-for-user.service.js";

export async function getMyCartService(userId: string) {
  const customer = await ensureCustomerForUserService(userId);

  const cart = await getOrCreateCartService(customer.id);

  const subtotalCents = cart.items.reduce((acc, item) => acc + item.totalCents, 0);

  return {
    ...cart,
    summary: {
      itemsCount: cart.items.length,
      subtotalCents,
    },
  };
}