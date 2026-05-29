# Production Runbook

이 문서는 SCSA Issue Tracker를 실제 배포 환경에서 운영할 때 확인할 내용을 정리한다.

비밀번호, JWT secret, DB password 같은 비밀값은 이 문서에 기록하지 않는다. 실제 값은 Render/Vercel의 환경변수 화면에서만 관리한다.

## Current Production URLs

| Component | URL |
| --- | --- |
| Frontend | `https://scsa-issue-tracker.vercel.app` |
| Backend API | `https://scsa-issue-tracker-api.onrender.com` |
| Backend health check | `https://scsa-issue-tracker-api.onrender.com/api/health` |

## Deployment Architecture

```text
Browser
  -> Vercel frontend
  -> /api/* rewrite
  -> Render Spring Boot backend
  -> Render PostgreSQL
```

### Frontend

- Platform: Vercel
- App root: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- API strategy: relative path + Vercel rewrite

The frontend API client uses relative paths such as `/api/v1`.

In local development, `vite.config.js` proxies `/api` to `http://localhost:8081`.

In production, `frontend/vercel.json` rewrites `/api/*` to the Render backend.

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://scsa-issue-tracker-api.onrender.com/api/:path*"
    }
  ]
}
```

### Backend

- Platform: Render Web Service
- Service name: `scsa-issue-tracker-api`
- Runtime: Docker
- Source branch: `backend-dev`
- App root: `backend`
- Dockerfile path: `backend/Dockerfile`
- Production profile: `prod`

Render builds the backend by reading `backend/Dockerfile`.

```text
eclipse-temurin:17-jdk
  -> Gradle bootJar
  -> app.jar

eclipse-temurin:17-jre
  -> java -jar app.jar
```

### Database

- Platform: Render PostgreSQL
- Database name: `scsa_issue_tracker`
- User: `scsa_app`
- Region: Oregon (US West)
- Free instance limit: 1 GB
- Free database expiration shown in Render: 2026-06-27

Long-running production use requires upgrading the database or migrating to another managed PostgreSQL provider before expiration.

## Backend Environment Variables

Render backend service requires these variables.

| Name | Purpose |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | Use `prod` settings |
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | JWT signing secret |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins |

Current expected shape:

```text
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:postgresql://<render-internal-host>:5432/scsa_issue_tracker
DB_USERNAME=scsa_app
DB_PASSWORD=<secret>
JWT_SECRET=<secret>
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://scsa-issue-tracker.vercel.app
```

Do not commit these secret values.

## Database Migration Policy

The backend uses Flyway to manage database schema changes.

Local Oracle and production PostgreSQL use separate migration directories.

```text
backend/src/main/resources/db/migration/oracle
backend/src/main/resources/db/migration/postgresql
```

Production uses:

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.locations=classpath:db/migration/postgresql
```

This means:

- Flyway creates or changes database tables.
- Hibernate only validates that entities and tables match.
- Entity changes that need schema changes must include a new Flyway migration in the same PR.
- Do not edit an already-merged migration file. Add a new `V{number}__description.sql` file instead.

## Deployment Checks

Before merging backend changes:

```bash
cd backend
./gradlew.bat compileJava
./gradlew.bat test
```

After backend deploy:

```bash
curl https://scsa-issue-tracker-api.onrender.com/api/health
```

Expected response:

```json
{"status":"ok"}
```

After frontend deploy:

```bash
curl https://scsa-issue-tracker.vercel.app
curl https://scsa-issue-tracker.vercel.app/api/health
```

Expected API rewrite response:

```json
{"status":"ok"}
```

## Common Issues

### Render free instance wakes up slowly

Render Free Web Service can spin down after inactivity.

First request after sleep can take 30-60 seconds or more.

Symptoms:

```text
Application loading
Service waking up
```

This is expected for the free instance.

### Vercel preview fails on backend-only PR

Vercel can attempt a preview deployment for every GitHub PR, even backend-only branches.

If a backend PR passes backend checks but the Vercel preview fails, inspect whether the failure is only a frontend preview deployment. A Vercel preview failure does not necessarily mean backend code is broken.

### API works locally but fails on Vercel

Check `frontend/vercel.json`.

The frontend uses `/api/v1` relative paths. Vercel must rewrite `/api/*` to Render backend.

Also check Render backend `CORS_ALLOWED_ORIGINS` includes:

```text
https://scsa-issue-tracker.vercel.app
```

### PostgreSQL query fails but Oracle local worked

Oracle and PostgreSQL differ in SQL dialect and type inference.

Example issue observed:

```text
ERROR: function lower(bytea) does not exist
```

Cause:

```text
JPQL nullable parameters such as :keyword is null can make PostgreSQL infer an unexpected parameter type.
```

Preferred fix:

```text
Build dynamic filters in Java with Specification/Criteria and include only conditions that have actual values.
```

## Manual Redeploy

Backend:

```text
Render
-> scsa-issue-tracker-api
-> Manual Deploy
-> Deploy latest commit
```

Frontend:

```text
Vercel
-> scsa-issue-tracker
-> Deployments
-> Redeploy
```

## Current Operational Notes

- Backend deploy source is `backend-dev`.
- Frontend production currently serves `https://scsa-issue-tracker.vercel.app`.
- Render PostgreSQL free database expires on 2026-06-27 unless upgraded.
- Keep secrets out of GitHub, screenshots, issue comments, and chat logs.
