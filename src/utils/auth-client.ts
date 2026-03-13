import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth.js";

const authRoutes = Router();

authRoutes.all("/*", async (req, res) => {
  try {
    const url = new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);

    const request = new Request(url.toString(), {
      method: req.method,
      headers: fromNodeHeaders(req.headers as Record<string, string | string[]>),
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const response = await auth.handler(request);

    res.status(response.status);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return res.json(data);
    }

    const text = await response.text();
    return res.send(text);
  } catch (error) {
    console.error("Better Auth route error:", error);

    return res.status(500).json({
      message: "Erro interno nas rotas de autenticação.",
    });
  }
});

export default authRoutes;