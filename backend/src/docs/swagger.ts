import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TradeAI Assessment API",
      version: "1.0.0",
      description: "Versioned REST API with JWT authentication, role-based access (ADMIN/USER), and task CRUD.",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Role: {
          type: "string",
          enum: ["ADMIN", "USER"],
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { $ref: "#/components/schemas/Role" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            completed: { type: "boolean" },
            userId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 3 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        CreateTaskInput: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            completed: { type: "boolean" },
          },
        },
        UpdateRoleInput: {
          type: "object",
          required: ["role"],
          properties: {
            role: { $ref: "#/components/schemas/Role" },
          },
        },
      },
    },

    paths: {
      "/register": {
        post: {
          tags: ["Auth"],
          summary: "Register user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterInput" },
              },
            },
          },
          responses: {
            201: { description: "Created" },
            400: { description: "Validation failed" },
            409: { description: "Email already exists" },
          },
        },
      },

      "/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginInput" },
              },
            },
          },
          responses: {
            200: { description: "Success" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Success" }, 401: { description: "Unauthorized" } },
        },
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: "Get all users",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Success" }, 403: { description: "Forbidden" } },
        },
      },
      "/users/{id}/role": {
        patch: {
          tags: ["Users"],
          summary: "Update user role (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateRoleInput" } } },
          },
          responses: { 200: { description: "Updated" }, 403: { description: "Forbidden" } },
        },
      },
      "/tasks": {
        post: {
          tags: ["Tasks"],
          summary: "Create task",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTaskInput" } } },
          },
          responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } },
        },
        get: {
          tags: ["Tasks"],
          summary: "List tasks",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Success" }, 401: { description: "Unauthorized" } },
        },
      },
      "/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get task by id",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { 200: { description: "Success" }, 403: { description: "Forbidden" }, 404: { description: "Not found" } },
        },
        patch: {
          tags: ["Tasks"],
          summary: "Update task",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTaskInput" } } },
          },
          responses: { 200: { description: "Updated" }, 403: { description: "Forbidden" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete task",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { 200: { description: "Deleted" }, 403: { description: "Forbidden" }, 404: { description: "Not found" } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);