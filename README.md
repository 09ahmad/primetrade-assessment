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

## Scalability note

The backend is modular by domain (`routes`, `services`, `validators`) and versioned (`/api/v1`), making it straightforward to split modules into separate services later. For scale-out, the first upgrades should be Redis-backed rate limiting / caching and horizontal API replicas behind a load balancer.
