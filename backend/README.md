# TradeAI Assessment Backend

Minimal Bun + Express API implementing:
- JWT auth (`register`, `login`)
- Role-based access (`ADMIN`, `USER`)
- Task CRUD with ownership rules
- API versioning under `/api/v1`
- Swagger docs at `/api/v1/docs`

## Run with Docker

From repository root:

```bash
docker compose up --build
```

Backend: `http://localhost:3000`  
Swagger: `http://localhost:3000/api/v1/docs`

Default admin:
- Email: `admin@tradeai.com`
- Password: `Admin1234`

## Key Endpoints

- `POST /api/v1/register`
- `POST /api/v1/login`
- `GET /api/v1/me`
- `GET /api/v1/users` (admin only)
- `PATCH /api/v1/users/:id/role` (admin only)
- `POST /api/v1/tasks`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

## Tests

```bash
cd backend
bun run test
```