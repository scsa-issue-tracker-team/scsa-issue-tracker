# Production Runbook

This document records the current production deployment shape and the first
checks to run when something looks broken.

## Services

- Frontend: `https://scsa-issue-tracker.vercel.app`
- Backend: `https://scsa-issue-tracker-api.onrender.com`
- Backend health: `https://scsa-issue-tracker-api.onrender.com/api/health`
- Database: Render PostgreSQL

## Deployment Sources

- Vercel production branch: `frontend-dev`
- Render backend branch: `backend-dev`

Do not rely on `main` as the current production trigger.

## Frontend Notes

The frontend app uses `/api/v1/...` for HTTP API calls.
`frontend/vercel.json` rewrites those requests to the Render backend.

WebSocket chat connects directly to Render:

```text
wss://scsa-issue-tracker-api.onrender.com/ws
```

This avoids relying on Vercel as a WebSocket upgrade proxy.

## Backend Notes

Render needs these production variables:

```text
SPRING_PROFILES_ACTIVE=prod
DB_URL=...
DB_USERNAME=...
DB_PASSWORD=...
JWT_SECRET=...
CORS_ALLOWED_ORIGINS=https://scsa-issue-tracker.vercel.app
```

Flyway runs PostgreSQL migrations from:

```text
classpath:db/migration/postgresql
```

Local Oracle migrations live separately under:

```text
classpath:db/migration/oracle
```

## WebSocket Chat Checks

If chat says "connection error":

1. Check the deployed frontend bundle includes the Render WebSocket URL.
2. Check Render backend is awake.
3. Confirm the user is logged in and has a valid JWT.
4. Confirm the user is a project creator or project member.
5. Check Render logs for WebSocket handshake or STOMP authorization errors.

Expected STOMP contract:

```text
Endpoint: /ws
CONNECT header: Authorization: Bearer {accessToken}
SEND: /app/projects/{projectId}/chat.send
SUBSCRIBE: /topic/projects/{projectId}/chat
```

## Demo Routine

1. Visit backend health URL to wake Render.
2. Open the frontend URL.
3. Log in with demo accounts.
4. Prepare one project with at least two members.
5. Prepare a few issues across different statuses.
6. Test comments, notifications, and chat before presenting.
7. Keep the chat panel open only when demonstrating real-time collaboration.

## Common Failures

### Direct URL opens Vercel 404

Check `frontend/vercel.json` includes SPA fallback:

```json
{ "source": "/:path*", "destination": "/index.html" }
```

### API works locally but not on Vercel

Check `frontend/vercel.json` API rewrite and Render service health.

### Refresh logs the user out

Check `/auth/me` behavior and frontend token restore logic.

### Render is slow on first request

Render free instances sleep after inactivity. Wake the backend before demos.
