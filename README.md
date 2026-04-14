# TradeAI Full-Stack Assessment

This project includes:
- `backend`: Bun + Express + Prisma + PostgreSQL API
- `frontend`: React + Vite UI for authentication and task CRUD

## One-command bootstrap

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/v1/docs`

Default seeded admin:
- Email: `admin@tradeai.com`
- Password: `Admin1234`

## Role-based behavior (important for evaluation)

The application now has a clear role split visible in both backend and frontend.

| Capability | ADMIN | USER |
|---|---|---|
| Register/Login | ✅ | ✅ |
| View all tasks (`GET /tasks`, `GET /tasks/:id`) | ✅ | ✅ |
| Create task (`POST /tasks`) | ✅ | ❌ |
| Edit task (`PATCH /tasks/:id`) | ✅ | ❌ |
| Delete task (`DELETE /tasks/:id`) | ✅ | ❌ |
| UI Task Form (create/edit) | ✅ visible | ❌ hidden |
| UI Task Action Buttons (edit/toggle/delete) | ✅ visible | ❌ hidden |

### How examiner can verify quickly

1. Login as admin (`admin@tradeai.com` / `Admin1234`) and create/update/delete tasks from UI.
2. Register a new normal user from the same UI.
3. Login as that user:
   - User can see task list.
   - User cannot see create/edit/delete controls.
   - If attempted via API client, backend returns `403` on create/update/delete task routes.

