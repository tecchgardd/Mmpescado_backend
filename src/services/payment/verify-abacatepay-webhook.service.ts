import crypto from "node:crypto";

const ABACATEPAY_PUBLIC_WB_KEY = process.env.ABACATEPAY_PUBLIC_WB_KEY;

export function verifyAbacatepayWebhook(
  rawBody: string,
  signatureFromHeader: string,
) {

  if(!ABACATEPAY_PUBLIC_WB_KEY) {
    throw new Error("ABACATEPAY_PUBLIC_WB_KEY não configurada.");
  }

  const expectedSig = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_WB_KEY)
    .update(Buffer.from(rawBody, "utf8"))
    .digest("base64");

  const A = Buffer.from(expectedSig, "utf8");
  const B = Buffer.from(signatureFromHeader, "utf8");

  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}