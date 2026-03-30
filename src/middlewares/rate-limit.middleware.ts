import rateLimit from "express-rate-limit";

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Muitas requisições. Tente novamente mais tarde.",
  },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 900,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Muitas tentativas de autenticação. Tente novamente mais tarde.",
  },
});

export const webhookRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Muitas requisições no webhook.",
  },
});