import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./helpers";
import { prismaClient } from "../src/utils/generatedClient";
import { TEST_USERS } from "./setup";

const REGISTER_EMAIL = "TEST__newuser@test.com";

describe("Auth — POST /api/v1/register", () => {

  beforeEach(async () => {
    await prismaClient.user.deleteMany({
      where: { email: REGISTER_EMAIL },
    });
  });

  it("should register a new user and return token", async () => {
    const res = await api.post("/api/v1/register").send({
      name: "New User",
      email: REGISTER_EMAIL,
      password: "Password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe("USER");
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("should return 409 if email already registered", async () => {
    await api.post("/api/v1/register").send({
      name: "New User",
      email: REGISTER_EMAIL,
      password: "Password123",
    });

    const res = await api.post("/api/v1/register").send({
      name: "New User",
      email: REGISTER_EMAIL,
      password: "Password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 if name is too short", async () => {
    const res = await api.post("/api/v1/register").send({
      name: "AB",
      email: REGISTER_EMAIL,
      password: "Password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors.name).toBeDefined();
  });

  it("should return 400 if email is invalid", async () => {
    const res = await api.post("/api/v1/register").send({
      name: "New User",
      email: "not-an-email",
      password: "Password123",
    });

    expect(res.status).toBe(400);
  });
});

describe("Auth — POST /api/v1/login", () => {

  it("should login successfully and return token", async () => {
    const res = await api.post("/api/v1/login").send({
      email: TEST_USERS.admin.email,
      password: "Admin1234",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_USERS.admin.email);
  });

  it("should return 401 for wrong password", async () => {
    const res = await api.post("/api/v1/login").send({
      email: TEST_USERS.admin.email,
      password: "WrongPassword1",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 for non-existent email", async () => {
    const res = await api.post("/api/v1/login").send({
      email: "ghost@test.com",
      password: "Password123",
    });

    expect(res.status).toBe(401);
  });

  it("should return 400 if body is empty", async () => {
    const res = await api.post("/api/v1/login").send({});
    expect(res.status).toBe(400);
  });
});