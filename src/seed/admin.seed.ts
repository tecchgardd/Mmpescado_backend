import { prisma } from "../database/prisma.js";
import bcrypt from "bcrypt";

async function run() {
  const email = "admin@mmpescado.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin já existe.");
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
    },
  });

  console.log("Admin criado com sucesso.");
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });