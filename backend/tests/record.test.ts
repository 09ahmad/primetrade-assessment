import { describe, it, expect, beforeAll } from "vitest";
import { api, getToken, authHeader } from "./helpers";
import { prismaClient } from "../src/utils/generatedClient";
import { TEST_USERS } from "./setup";

let createdTaskId: string;

beforeAll(async () => {
  const task = await prismaClient.task.create({
    data: {
      userId: TEST_USERS.admin.id,
      title: "Admin seeded task",
      description: "Seeded task for integration test",
    },
  });
  createdTaskId = task.id;
});

describe("Tasks — POST /api/v1/tasks", () => {
  it("should create a task as ADMIN", async () => {
    const token = await getToken("ADMIN");

    const res = await api
      .post("/api/v1/tasks")
      .set(authHeader(token))
      .send({
        title: "Write docs",
        description: "Prepare README section",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Write docs");
  });

  it("should create a task as USER", async () => {
    const token = await getToken("USER");

    const res = await api
      .post("/api/v1/tasks")
      .set(authHeader(token))
      .send({
        title: "User task",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe(TEST_USERS.user.id);
  });

  it("should return 400 for missing title", async () => {
    const token = await getToken("ADMIN");
    const res = await api
      .post("/api/v1/tasks")
      .set(authHeader(token))
      .send({});
    expect(res.status).toBe(400);
  });

  it("should return 401 with no token", async () => {
    const res = await api.post("/api/v1/tasks").send({ title: "No token" });

    expect(res.status).toBe(401);
  });
});

describe("Tasks — GET /api/v1/tasks", () => {
  it("should return only own tasks for USER", async () => {
    const token = await getToken("USER");
    const res = await api.get("/api/v1/tasks").set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((task: any) => {
      expect(task.userId).toBe(TEST_USERS.user.id);
    });
  });

  it("should return all tasks for ADMIN", async () => {
    const token = await getToken("ADMIN");
    const res = await api.get("/api/v1/tasks").set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe("Tasks — GET /api/v1/tasks/:id", () => {
  it("should return task by id for ADMIN", async () => {
    const token = await getToken("ADMIN");
    const res = await api
      .get(`/api/v1/tasks/${createdTaskId}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdTaskId);
  });

  it("should return 403 if USER tries to access admin task", async () => {
    const token = await getToken("USER");
    const res = await api
      .get(`/api/v1/tasks/${createdTaskId}`)
      .set(authHeader(token));

    expect(res.status).toBe(403);
  });

  it("should return 404 for unknown task", async () => {
    const token = await getToken("ADMIN");
    const res = await api
      .get("/api/v1/tasks/non-existent-task-id")
      .set(authHeader(token));

    expect(res.status).toBe(404);
  });
});

describe("Tasks — PATCH /api/v1/tasks/:id", () => {
  it("should update task as ADMIN", async () => {
    const token = await getToken("ADMIN");
    const res = await api
      .patch(`/api/v1/tasks/${createdTaskId}`)
      .set(authHeader(token))
      .send({ completed: true, title: "Updated title" });

    expect(res.status).toBe(200);
    expect(res.body.data.completed).toBe(true);
  });

  it("should return 403 when USER updates admin task", async () => {
    const token = await getToken("USER");
    const res = await api
      .patch(`/api/v1/tasks/${createdTaskId}`)
      .set(authHeader(token))
      .send({ completed: true });
    expect(res.status).toBe(403);
  });
});

describe("Tasks — DELETE /api/v1/tasks/:id", () => {
  it("should delete task as ADMIN", async () => {
    const token = await getToken("ADMIN");
    const res = await api
      .delete(`/api/v1/tasks/${createdTaskId}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Task deleted");

    const listRes = await api
      .get("/api/v1/tasks")
      .set(authHeader(token));
    const found = listRes.body.data.find((task: any) => task.id === createdTaskId);
    expect(found).toBeUndefined();
  });

  it("should return 404 for already deleted task", async () => {
    const token = await getToken("ADMIN");
    const res = await api
      .delete(`/api/v1/tasks/${createdTaskId}`)
      .set(authHeader(token));
    expect(res.status).toBe(404);
  });
});