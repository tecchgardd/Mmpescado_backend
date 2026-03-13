import crypto from "node:crypto";

export function verifyAbacatepayWebhook(
  rawBody: string,
  signatureFromHeader: string,
) {
  const publicKey = process.env.ABACATEPAY_PUBLIC_HMAC_KEY;

  if (!publicKey) {
    throw new Error("ABACATEPAY_PUBLIC_HMAC_KEY não configurada.");
  }

  const expectedSig = crypto
    .createHmac("sha256", publicKey)
    .update(Buffer.from(rawBody, "utf8"))
    .digest("base64");

  const A = Buffer.from(expectedSig);
  const B = Buffer.from(signatureFromHeader);

  return A.length === B.length && crypto.timingSafeEqual(A, B);
}