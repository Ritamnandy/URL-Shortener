# URL Shortener

A TypeScript/Express URL-shortening service with email-verified accounts, JWT authentication, Redis caching, PostgreSQL persistence, and queued email delivery.

It provides a small browser UI at `/login`, `/register`, and `/dashboard`, plus a versioned JSON API under `/api/v1`. See [API.md](API.md) for every available endpoint, request shape, and response convention.

## Features

- Email-based registration and verification codes
- Login, logout, refresh-token, profile, and password-reset flows
- Authenticated creation, retrieval, update, and deletion of short URLs
- Public `302` redirects from `/:shortUrl` to the stored destination
- PostgreSQL storage through Prisma
- Redis caching for URL records and temporary auth state
- BullMQ email queue with retry/backoff and a concurrent worker
- HTTP-only access and refresh-token cookies; protected APIs also accept Bearer tokens
- Helmet, CORS, compression, request logging, request-size limits, and per-route rate limits

## Stack

Node.js, TypeScript, Express 5, Prisma 7, PostgreSQL, Redis, BullMQ, Zod, JWT, Nodemailer, and EJS.

## Prerequisites

- Node.js compatible with the project's dependencies, or Bun (the repository includes `bun.lock`)
- PostgreSQL and Redis, or Docker Compose (which supplies PostgreSQL 17 and Redis 8)
- A Gmail account/app password for email delivery

## Configure and run

1. Install dependencies:

   ```bash
   bun install
   ```

   `npm install` also works if you use npm instead of Bun.

2. Start PostgreSQL and Redis. The included Compose file exposes PostgreSQL on `5432` and Redis on `6379`:

   ```bash
   docker compose up -d
   ```

   The Postgres volume is declared as external, so create it once if Docker reports it is missing:

   ```bash
   docker volume create postgres-volume
   ```

3. Create `.env` from `.simple.env`, then replace the placeholders. Add the two mail variables shown below; they are required by the mail transport but are not present in `.simple.env`.

   ```dotenv
   DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=url_shortener"
   REDIS_HOST=localhost
   REDIS_PORT=6379
   PORT=3000
   CORS_ORIGIN=http://localhost:3000
   FORGOT_PASSWORD_URL=http://localhost:3000/forgot-password

   JWT_TOKEN_SECRET=replace-with-a-long-random-secret
   JWT_TOKEN_EXPIRES_IN=3h
   REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-secret
   REFRESH_TOKEN_EXPIRES_IN=14d

   EMAIL=sender@example.com
   EMAIL_PASSWORD=your-gmail-app-password
   NODE_ENV=development
   ```

   `DATABASE_URL` must target the `url_shortener` PostgreSQL schema: the Prisma adapter is explicitly configured to use that schema. Keep `CORS_ORIGIN` aligned with the browser client origin when using cookie authentication; production cookies require HTTPS and use `SameSite=None`.

4. Generate the Prisma client and apply the committed migration:

   ```bash
   bunx prisma generate
   bunx prisma migrate deploy
   ```

5. Start the service:

   ```bash
   bun run dev
   ```

   The health endpoint is available at `http://localhost:3000/`.

## Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Run the TypeScript server with automatic reloads. |
| `bun run build` | Compile TypeScript to `dist/`. |
| `bun run start` | Run the compiled app. |

> The current `start` script points to `build/index.js`, while `tsconfig.json` compiles to `dist/`. Use `node dist/index.js` after a build, or update the script before deploying.

## Project layout

```text
src/
  app.ts                 Express middleware and route registration
  controllers/           HTTP handlers
  services/              Application rules, caching, and short-code generation
  repositories/          Prisma, Redis, and BullMQ access
  routes/                API route definitions
  schemas/               Zod request validation
  jobs/                  Email queue and worker
  views/                 EJS pages
prisma/                  Prisma schema and migration history
API.md                   Endpoint reference
```

## Authentication

Successful email verification, login, and token refresh set `accessToken` and `refreshToken` as HTTP-only cookies. Protected endpoints also accept the access token in the following header:

```http
Authorization: Bearer <access-token>
```

The access-cookie lifetime is three hours and the refresh-cookie lifetime is fourteen days. JWT lifetimes themselves come from `JWT_TOKEN_EXPIRES_IN` and `REFRESH_TOKEN_EXPIRES_IN`.

## Operational notes from the current implementation

- Email jobs are processed in the same server process because `src/app.ts` imports the BullMQ worker. Redis must therefore be available at startup.
- The cache repository currently applies a fixed five-minute expiry to every cache write. This means registration/verification and reset-state lifetimes are five minutes in practice, even where the service code describes longer intended durations.
- Email verification creates the account but does not set the persisted `User.isVerified` field to `true`; authentication does not currently check that field. If it will be used for authorization later, update it during verification.
- The password-reset flow is not currently usable end-to-end: `POST /reset-password` validates `token` as a six-digit code, whereas the reset service expects a generated reset token. The emailed URL also contains a hash rather than the raw token the service looks up. This should be corrected before exposing password reset to users.
- Success envelopes for `201 Created` endpoints currently contain `"statusCode": 200` because their controllers call `ApiResponse.ok`; use the HTTP status as the authoritative status. Details are in [API.md](API.md).

## API documentation

Read [API.md](API.md) for authentication, validation, endpoint-specific rate limits, examples, and response/error formats.

## License

The repository currently declares the ISC license in `package.json`.
