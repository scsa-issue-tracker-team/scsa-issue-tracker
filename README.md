# SCSA Issue Tracker

SCSA Issue Tracker is a project-based issue tracker for team collaboration.
It supports project membership, issue management, comments/replies, reactions,
notifications, dashboards, and project-member real-time chat.

## Live Services

- Frontend: https://scsa-issue-tracker.vercel.app
- Backend API: https://scsa-issue-tracker-api.onrender.com
- Backend health check: https://scsa-issue-tracker-api.onrender.com/api/health

## Tech Stack

- Frontend: React 18, Vite, React Router, STOMP WebSocket
- Backend: Java 17, Spring Boot 3.5, Spring Security, JWT, JPA, WebSocket/STOMP
- Database: PostgreSQL on Render for production, Oracle XE for local legacy testing
- Deployment: Vercel frontend, Render backend, Render PostgreSQL
- Migration: Flyway

## Repository Structure

```text
scsa-issue-tracker/
|-- backend/       Spring Boot API server
|-- frontend/      React/Vite frontend app
|-- docs/          Deployment and operation notes
|-- README.md
`-- .gitignore
```

## Main Branches

- `frontend-dev`: frontend production branch used by Vercel
- `backend-dev`: backend production branch used by Render
- `main`: integration/archive branch, not the current production trigger

Feature branches should be merged into the matching production branch:

- Frontend work -> `frontend-dev`
- Backend work -> `backend-dev`

## Local Development

### Backend

```bash
cd backend
./gradlew bootRun
```

On Windows:

```bash
cd backend
gradlew.bat bootRun
```

Default local backend URL:

```text
http://localhost:8081
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Default local frontend URL:

```text
http://localhost:5173
```

Local frontend API requests are proxied to the backend by `frontend/vite.config.js`.

## Production Deployment

### Frontend

Vercel builds the `frontend` directory from `frontend-dev`.

Important settings:

- Framework: Vite
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `frontend-dev`

API calls use relative paths such as `/api/v1/...`.
`frontend/vercel.json` rewrites those HTTP requests to the Render backend.

WebSocket connections use:

```text
wss://scsa-issue-tracker-api.onrender.com/ws
```

This direct Render URL is intentional because Vercel HTTP rewrites are not a
reliable WebSocket upgrade proxy.

### Backend

Render builds and deploys `backend-dev`.

Required production environment variables:

- `SPRING_PROFILES_ACTIVE=prod`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS=https://scsa-issue-tracker.vercel.app`

Render free instances can sleep after inactivity. Wake the backend before demos.

## Chat WebSocket Contract

REST history:

```http
GET /api/v1/projects/{projectId}/chat/messages?limit=50&offset=0
```

REST send:

```http
POST /api/v1/projects/{projectId}/chat/messages
Content-Type: application/json

{ "content": "message" }
```

STOMP WebSocket:

```text
Endpoint: /ws
CONNECT header: Authorization: Bearer {accessToken}
SEND: /app/projects/{projectId}/chat.send
SUBSCRIBE: /topic/projects/{projectId}/chat
```

Only project creators and project members can read, subscribe, or send chat messages.

## Demo Checklist

Before presenting:

1. Open the backend health check once to wake the Render service.
2. Open the Vercel frontend and log in.
3. Confirm project list, issue board, issue detail, comments, notifications, and chat.
4. Use two browsers or an incognito window to demonstrate real-time chat.
5. Keep demo projects and messages clean enough for the audience.

## Contributors

- Lee Ji Eon
- Na Danbi
- Park Si Woo
- Lee Jae Won
