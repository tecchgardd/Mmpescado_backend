import app from "./app.js";

if (process.env.NODE_ENV !== "production") {
  const PORT = 3333;
  app.listen(PORT, () => {
    console.log(`🔥 Server rodando em http://localhost:${PORT}`);
    console.log(`📚 Swagger em http://localhost:${PORT}/docs`);
  });
}

export default app; // ← Vercel usa isso em produção