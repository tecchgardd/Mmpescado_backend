import app from "./app.js";

const PORT = 3333;

app.listen(PORT, () => {
  console.log(`🔥 Server rodando em http://localhost:${PORT}`);
  console.log(`📚 Swagger em http://localhost:${PORT}/docs`);
});