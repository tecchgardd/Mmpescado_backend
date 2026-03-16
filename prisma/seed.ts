import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não definida no arquivo .env");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function run() {
  const email = "admin@mmpescado.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("⚠️ Admin já existe.");
    return;
  }

  const passwordHash = await bcrypt.hash("12345678", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
    },
  });

  console.log("✅ Admin criado com sucesso.");
  console.log({
    id: admin.id,
    email: admin.email,
    senha: "12345678",
    role: admin.role,
  });
}

run()
  .catch((error) => {
    console.error("❌ Erro no seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });