import supertest from "supertest";
import { app } from "../src/app";
import { TEST_USERS } from "./setup";

export const api = supertest(app);

const tokenCache: Record<string, string> = {};

export async function getToken(role: "ADMIN" | "USER"): Promise<string> {
  if (tokenCache[role]) return tokenCache[role];

  const emailMap = {
    ADMIN: TEST_USERS.admin.email,
    USER: TEST_USERS.user.email,
  };

  const res = await api
    .post("/api/v1/login")
    .send({ email: emailMap[role], password: "Admin1234" });

  tokenCache[role] = res.body.data.token;
  return tokenCache[role] as string;
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}