import bcrypt from "bcrypt";
import { prismaClient } from "../utils/generatedClient";

async function main() {
  const hashedPassword = await bcrypt.hash("Admin1234", 10);

  await prismaClient.user.upsert({
    where: { email: "admin@tradeai.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@tradeai.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user seeded: admin@tradeai.com / Admin1234");
}

main();