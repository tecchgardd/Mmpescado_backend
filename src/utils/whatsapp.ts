export function getWhatsAppUrl(input: {
  orderCode: string;
  totalCents: number;
}) {
  const whatsappPhone = process.env.WHATSAPP_PHONE_NUMBER?.replace(/\D/g, "");
  const amount = (input.totalCents / 100).toFixed(2).replace(".", ",");
  const text = encodeURIComponent(
    `Olá, quero confirmar o pedido ${input.orderCode} no valor de R$ ${amount}.`,
  );

  if (whatsappPhone) {
    return `https://wa.me/${whatsappPhone}?text=${text}`;
  }

  return `https://wa.me/?text=${text}`;
}
