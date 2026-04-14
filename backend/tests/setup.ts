import { beforeAll, afterAll } from "vitest";
import { prismaClient } from "../src/utils/generatedClient";
import bcrypt from "bcrypt";

// All test data uses this prefix — easy to identify and clean up
export const TEST_PREFIX = "TEST__";

export const TEST_USERS = {
  admin: { id: `${TEST_PREFIX}admin-id`, email: `${TEST_PREFIX}admin@test.com` },
  user: { id: `${TEST_PREFIX}user-id`, email: `${TEST_PREFIX}user@test.com` },
};

beforeAll(async () => {
  await prismaClient.task.deleteMany({
    where: { userId: { in: Object.values(TEST_USERS).map(u => u.id) } },
  });
  await prismaClient.user.deleteMany({
    where: { email: { startsWith: TEST_PREFIX } },
  });

  const hashedPassword = await bcrypt.hash("Admin1234", 10);

  await prismaClient.user.createMany({
    data: [
      {
        id: TEST_USERS.admin.id,
        name: "Test Admin",
        email: TEST_USERS.admin.email,
        password: hashedPassword,
        role: "ADMIN",
      },
      {
        id: TEST_USERS.user.id,
        name: "Test User",
        email: TEST_USERS.user.email,
        password: hashedPassword,
        role: "USER",
      },
    ],
  });
});

afterAll(async () => {
  await prismaClient.task.deleteMany({
    where: { userId: { in: Object.values(TEST_USERS).map(u => u.id) } },
  });
  await prismaClient.user.deleteMany({
    where: { email: { startsWith: TEST_PREFIX } },
  });

  await prismaClient.$disconnect();
});