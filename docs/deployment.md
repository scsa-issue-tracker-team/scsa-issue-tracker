# Deployment Notes

## Profiles

The backend now separates local and production settings.

- `local`: default profile for development.
- `prod`: deployment profile.

Run locally:

```bash
cd backend
./gradlew.bat bootRun
```

Run with production profile:

```bash
SPRING_PROFILES_ACTIVE=prod ./gradlew.bat bootRun
```

## Required Production Environment Variables

| Name | Example | Description |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` | Enables production settings |
| `DB_URL` | `jdbc:postgresql://...` | PostgreSQL JDBC URL |
| `DB_USERNAME` | `hr` | Database username |
| `DB_PASSWORD` | `secret` | Database password |
| `JWT_SECRET` | Base64 encoded secret | JWT signing secret |
| `CORS_ALLOWED_ORIGINS` | `https://example.vercel.app` | Comma-separated frontend origins |

Optional:

| Name | Default | Description |
| --- | --- | --- |
| `PORT` | `8081` | Hosting platforms often provide this |
| `SERVER_PORT` | `8081` | Fallback server port |
| `JWT_ACCESS_TOKEN_VALIDITY_MILLISECONDS` | `1800000` | Access token lifetime |
| `DB_DRIVER_CLASS_NAME` | `org.postgresql.Driver` | JDBC driver |
| `JPA_DATABASE_PLATFORM` | `org.hibernate.dialect.PostgreSQLDialect` | Hibernate dialect |
| `FLYWAY_LOCATIONS` | `classpath:db/migration/postgresql` | Flyway migration location |

## Deployment Checks

Before deploying:

```bash
cd backend
./gradlew.bat test
```

After deploying:

```bash
curl https://YOUR_BACKEND_DOMAIN/api/health
```

## Notes

- Production uses `spring.jpa.hibernate.ddl-auto=validate`, so the database schema must already match the entities.
- Flyway runs database migrations from profile-specific locations.
- Local Oracle development uses `backend/src/main/resources/db/migration/oracle`.
- Production PostgreSQL deployment uses `backend/src/main/resources/db/migration/postgresql`.
- Local development uses `spring.flyway.baseline-on-migrate=true` so an existing non-empty Oracle schema can be marked as baseline version 1 without dropping data.
- Production defaults `FLYWAY_BASELINE_ON_MIGRATE=false`. Use `true` only when connecting to an existing schema that already matches `V1__init_schema.sql`.
- JPA uses `ddl-auto=validate` in both local and production profiles. This makes entity/schema mismatches fail fast instead of silently changing the database.

## Flyway Basics

Flyway migration files are versioned SQL files.

```text
V1__init_schema.sql
V2__add_operational_indexes.sql
V3__next_change.sql
```

Rules:

- Never edit a migration file after it has been merged and run by teammates.
- Add a new `V{number}__description.sql` file for each schema change.
- Keep Java entity changes and matching Flyway migrations in the same pull request.
