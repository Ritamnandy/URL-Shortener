# URL Shortener API Reference

Base URL: `http://localhost:3000` by default.

All API routes are prefixed with `/api/v1`. The JSON API accepts `application/json`; request bodies are limited to 16 KB.

## Authentication

Protected endpoints accept either:

```http
Authorization: Bearer <access-token>
```

or the `accessToken` HTTP-only cookie set by login, email verification, or refresh. Send `credentials: "include"` from a cross-origin browser client and configure `CORS_ORIGIN` to that client origin.

The server sets both cookies on successful verification, login, and refresh:

| Cookie | Server cookie lifetime | Production attributes |
| --- | --- | --- |
| `accessToken` | 3 hours | `HttpOnly; Secure; SameSite=None` |
| `refreshToken` | 14 days | `HttpOnly; Secure; SameSite=None` |

In non-production, cookies use `SameSite=Lax` and are not marked `Secure`. JWT expiration is separately controlled by the `JWT_TOKEN_EXPIRES_IN` and `REFRESH_TOKEN_EXPIRES_IN` environment variables.

## Response format

Successful API responses generally use this envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully",
  "error": null,
  "data": {}
}
```

Error responses use this shape:

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation error",
  "error": [
    ["email", ["Invalid email address"]]
  ],
  "data": null
}
```

`error` may contain strings or field/error-message pairs. In non-production, error responses also include a stack trace. `meta: {}` may appear on successful responses.

**Implementation note:** `POST /auth/register` and `POST /urls` correctly return HTTP `201`, but their JSON envelope currently says `"statusCode": 200`. Treat the HTTP response code as canonical.

## Shared schemas

### User registration

| Field | Required | Rules |
| --- | --- | --- |
| `first_name` | Yes | String, trimmed, 3–20 characters. |
| `last_name` | Yes | String, trimmed, 3–20 characters. |
| `email` | Yes | Valid email, lowercased and trimmed, max 100 characters. |
| `password` | Yes | 6–50 characters, with uppercase, lowercase, digit, and special character. |

### Login

| Field | Required | Rules |
| --- | --- | --- |
| `email` | Yes | Valid email, lowercased and trimmed, max 100 characters. |
| `password` | Yes | 1–50 characters. |

### Short URL

| Field | Required | Rules |
| --- | --- | --- |
| `originalUrl` | Create: yes; update: optional | Valid URL, trimmed, max 100 characters. |
| `title` | No | Trimmed string, max 100 characters. |

The generated `shortUrl` uses URL-safe random characters (`A–Z`, `a–z`, `0–9`, `_`, `-`). Path parameters must be 1–100 of those characters.

### Resource shapes

`User` data:

```json
{
  "id": "5f20b6ba-40f4-4b0e-b0d1-a6cba5d925d0",
  "first_name": "Ada",
  "last_name": "Lovelace",
  "email": "ada@example.com",
  "avatar": null
}
```

`ShortUrl` data:

```json
{
  "id": "754e7f8f-3f77-4f94-81fd-8529b75c8ecf",
  "shortUrl": "dXo5QbgY",
  "originalUrl": "https://example.com/articles/hello",
  "title": "Example article",
  "userId": "5f20b6ba-40f4-4b0e-b0d1-a6cba5d925d0",
  "expiryAt": null,
  "createdAt": "2026-08-18T12:00:00.000Z",
  "status": "ACTIVE"
}
```

## Health and pages

| Method | Path | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/` | None | Health response: `{ "success": true, "message": "Service is healthy" }`. |
| `GET` | `/login` | None | Renders the login EJS page. |
| `GET` | `/register` | None | Renders the registration EJS page. |
| `GET` | `/dashboard` | None | Renders the URL dashboard EJS page. |

## Authentication endpoints

### Register an account

`POST /api/v1/auth/register`

Creates a pending registration in Redis and queues a verification email. The database user is created only after email verification.

Rate limit: 5 requests per IP per 20 minutes.

```json
{
  "first_name": "Ada",
  "last_name": "Lovelace",
  "email": "ada@example.com",
  "password": "Complex!123"
}
```

Returns `201 Created`. There is no meaningful response data. Common failures: `400` if the email already belongs to a database user, `422` for invalid input, and `429` when rate limited.

### Verify email

`POST /api/v1/auth/verify-email`

Rate limit: 8 requests per IP per 20 minutes.

```json
{
  "email": "ada@example.com",
  "token": "123456"
}
```

Returns `200 OK`, creates the user, sets both auth cookies, and returns the user plus `accessToken` and `refreshToken` in `data`.

The code is six digits. Although service comments state a ten-minute validity, the current cache repository expires it after five minutes; see the implementation notes below.

### Resend verification code

`POST /api/v1/auth/resend-code`

Rate limit: 5 requests per IP per 20 minutes.

```json
{ "email": "ada@example.com" }
```

Returns `200 OK` with a confirmation message. A pending registration must still exist. The intended resend cooldown is two minutes, but the cache implementation currently uses five minutes for every cached item.

### Log in

`POST /api/v1/auth/login`

Rate limit: 5 requests per IP per 20 minutes.

```json
{
  "email": "ada@example.com",
  "password": "Complex!123"
}
```

Returns `200 OK`, sets both auth cookies, and returns the user plus `accessToken` and `refreshToken` in `data`. Typical failures return `400` for an unknown user or invalid credentials.

### Log out

`POST /api/v1/auth/logout`

Authentication required.

Returns `200 OK`, clears the two auth cookies, and invalidates the stored refresh token. The response has no meaningful data.

### Refresh tokens

`POST /api/v1/auth/refresh-token`

Send the refresh token as the `refreshToken` cookie or in the body:

```json
{ "refreshToken": "<refresh-token>" }
```

Returns `200 OK`, rotates both tokens, sets both cookies, and returns:

```json
{
  "accessToken": "<new-access-token>",
  "refreshToken": "<new-refresh-token>"
}
```

A missing token returns `401`; expired, invalid, or no-longer-current refresh tokens result in an auth-related error (typically `400`).

### Current user

`GET /api/v1/auth/me`

Authentication required. Rate limit: 5 requests per IP per 10 minutes.

Returns `200 OK` with a `User` object in `data`.

### Request a password reset

`POST /api/v1/auth/forgot-password`

Rate limit: 5 requests per IP per 20 minutes.

```json
{ "email": "ada@example.com" }
```

Returns `200 OK` after queuing a reset email. An unknown email returns `400`.

### Reset password

`POST /api/v1/auth/reset-password`

```json
{
  "email": "ada@example.com",
  "token": "123456",
  "newPassword": "NewComplex!123"
}
```

Returns `200 OK` after changing the password and queuing a notification email.

**Current limitation:** this endpoint is not operable as implemented. Request validation allows only a six-digit `token`, but the service looks up a hash of a generated reset token; the reset email includes the hash, not the original token. This must be aligned before using the flow in a client.

## URL endpoints

All endpoints in this section require authentication. Short URLs are owned by their creating user; access, modification, and deletion are restricted to that owner.

### Create a short URL

`POST /api/v1/urls`

Rate limit: 5 requests per IP per 10 minutes.

```json
{
  "originalUrl": "https://example.com/articles/hello",
  "title": "Example article"
}
```

Returns `201 Created` with a `ShortUrl` object in `data`.

### List the current user's URLs

`GET /api/v1/urls`

Rate limit: 5 requests per IP per 10 minutes.

Returns `200 OK` with an array of `ShortUrl` records ordered newest first. The endpoint does not implement pagination.

### Get a short URL record

`GET /api/v1/urls/:shortUrl`

Rate limit: 5 requests per IP per 10 minutes.

Returns `200 OK` with the matching `ShortUrl` record. A non-existent code and a code owned by another user both return `404`.

### Update a short URL

`PATCH /api/v1/urls/:shortUrl`

Rate limit: 5 requests per IP per 10 minutes. Send at least one editable field:

```json
{
  "originalUrl": "https://example.com/updated",
  "title": "Updated title"
}
```

Returns `200 OK` with the updated `ShortUrl` record. The short code, status, and expiry are not writable through this API.

### Delete a short URL

`DELETE /api/v1/urls/:shortUrl`

Rate limit: 5 requests per IP per 10 minutes.

Returns `200 OK` with `true` in `data`. The record is permanently deleted rather than marked deleted.

## Public redirect

`GET /:shortUrl`

No authentication is required. Returns an HTTP `302 Found` redirect to the stored `originalUrl` when the record is `ACTIVE` and not expired. Missing, disabled, blocked, deleted, expired, or already-expired URLs return `404`.

`/login`, `/register`, `/dashboard`, and the API prefixes are registered first, so those fixed paths do not invoke the redirect handler.

## Status codes

| Code | Used for |
| --- | --- |
| `200` | Successful reads, updates, auth actions, and deletion. |
| `201` | Registration request accepted and short URL creation. |
| `302` | Public short-link redirect. |
| `400` | Invalid business state, such as an existing user, missing verification state, or bad credentials. |
| `401` | Missing or invalid access token. |
| `404` | Unmatched route, unavailable short URL, or URL record not owned by the caller. |
| `422` | Zod request validation failure. |
| `429` | A route-specific rate limit or cooldown was exceeded. |
| `500` | Unhandled server, database, or mail delivery error. |
| `503` | Short-code generation could not find a unique code after five attempts. |

## Implementation notes

- Redis caching has a fixed five-minute TTL because `CacheRepository.set` ignores the TTL argument supplied by callers. Cached URL records and cached registration/reset state all share that actual lifetime.
- Email verification creates a user with the schema default `isVerified: false`; the service never updates that field, and current authentication does not inspect it.
- URL status and expiry checks are enforced only by the public redirect. The current create/update APIs do not expose those fields, so newly created links remain `ACTIVE` with no expiry unless changed outside these endpoints.
- The service generates and returns raw access and refresh tokens in successful login and verification response bodies in addition to cookies. Clients should avoid logging these responses.
