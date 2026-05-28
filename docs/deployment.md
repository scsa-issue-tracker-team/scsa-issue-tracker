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
| `DB_URL` | `jdbc:oracle:thin:@...` | Oracle JDBC URL |
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
| `DB_DRIVER_CLASS_NAME` | `oracle.jdbc.OracleDriver` | JDBC driver |
| `JPA_DATABASE_PLATFORM` | `org.hibernate.community.dialect.OracleLegacyDialect` | Hibernate dialect |

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
- Local development still uses `ddl-auto=update` to keep the beginner workflow light.
- Database migrations should be introduced before the first serious production release.
