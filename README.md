# Transactions API

A RESTful API for managing financial transactions, built with **Node.js**, **TypeScript**, and **Clean Architecture** principles.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** PostgreSQL (Knex.js)
- **Cache:** Redis (ioredis)
- **Auth:** JWT (access + refresh tokens)
- **DI Container:** Awilix
- **Validation:** Zod
- **Observability:** OpenTelemetry → Grafana (Loki · Tempo · Prometheus)
- **Testing:** Vitest (unit + integration)

## Architecture

```
src/
├── domain/          # Entities, interfaces, errors, enums
├── application/     # Use cases and validation schemas
├── infrastructure/  # Database, Redis, external services
├── presentation/    # Controllers, routes, middlewares
├── shared/          # DI container, environment config
└── main/            # Entry point, server, telemetry, jobs
```

Clean Architecture with dependency inversion — domain and application layers have zero framework dependencies.

## Features

- JWT authentication with refresh token rotation
- Deposit, withdraw, and transfer between accounts
- Transaction history with date filters
- Redis-based rate limiting
- Redis cache for user profile lookups
- Background job to clean up expired refresh tokens
- Health check endpoints for DB and Redis
- Graceful shutdown via `@godaddy/terminus`
- Structured logging with Winston
- Full observability stack (traces, metrics, logs) via OpenTelemetry

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose

### Setup

```bash
# Install dependencies
npm install

# Start infrastructure (Postgres, Redis, Grafana stack)
npm run docker:up

# Copy and configure environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`.  
Grafana dashboards at `http://localhost:3001`.

## API Endpoints

### Auth

| Method | Path               | Auth | Description                      |
| ------ | ------------------ | ---- | -------------------------------- |
| `POST` | `/auth/register`   | —    | Register a new user              |
| `POST` | `/auth/login`      | —    | Login and receive tokens         |
| `POST` | `/auth/logout`     | ✓    | Logout and invalidate token      |
| `POST` | `/auth/refresh`    | —    | Refresh access token             |
| `POST` | `/auth/reactivate` | —    | Reactivate a deactivated account |

### Transactions

All endpoints require authentication.

| Method | Path                     | Description                                          |
| ------ | ------------------------ | ---------------------------------------------------- |
| `GET`  | `/transactions`          | List transactions (supports `?type`, `?from`, `?to`) |
| `GET`  | `/transactions/balance`  | Get current balance                                  |
| `POST` | `/transactions/deposit`  | Deposit funds                                        |
| `POST` | `/transactions/withdraw` | Withdraw funds                                       |
| `POST` | `/transactions/transfer` | Transfer funds to another user                       |

### User

All endpoints require authentication.

| Method   | Path            | Description          |
| -------- | --------------- | -------------------- |
| `GET`    | `/user/profile` | Get own profile      |
| `PATCH`  | `/user/profile` | Update name or email |
| `DELETE` | `/user/account` | Deactivate account   |

### Health

| Method | Path                   | Description                      |
| ------ | ---------------------- | -------------------------------- |
| `GET`  | `/health`              | Liveness check                   |
| `GET`  | `/health/dependencies` | Checks external services status  |

## Scripts

```bash
npm run dev                   # Start with hot reload
npm run build                 # Compile TypeScript
npm run start                 # Run compiled build

npm run test                  # Run all tests
npm run test:unit             # Unit tests only
npm run test:integration      # Integration tests only
npm run test:coverage         # Generate coverage report

npm run migrate               # Apply pending migrations
npm run migrate:make          # Create a new migration
npm run migrate:rollback      # Rollback last batch

npm run lint                  # Lint source files
```

## Testing

Unit tests cover all use cases with mocked dependencies. Integration tests run against a real database and cover all repository methods.

```bash
npm run test:unit
npm run test:integration
```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced via Commitlint and Husky.
