# SCSA Issue Tracker

SCSA Issue Tracker는 DS, DX, SDS 같은 조직에서 발생하는 요청, 버그, 기능 개선, 일반 업무를 프로젝트 단위로 등록하고 상태를 추적하는 사내 협업용 이슈 관리 시스템입니다.

단순한 할 일 목록이 아니라, 프로젝트 멤버 권한과 이슈 상태 흐름을 기준으로 협업 과정을 관리하는 미니 이슈 트래커를 목표로 합니다.

## 주요 기능

- 회원가입과 JWT 기반 로그인
- 현재 로그인 사용자 조회
- 내 프로젝트 목록 조회
- 프로젝트 생성과 상세 조회
- 프로젝트 멤버 추가, 목록 조회, 제거
- 프로젝트 멤버 기반 접근 권한 검증
- 이슈 생성, 목록 조회, 상세 조회, 수정, 상태 변경, 삭제
- 댓글 작성과 목록 조회
- Swagger UI 기반 API 확인
- React 기반 프론트엔드 화면

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Backend | Java 17, Spring Boot 3.5.14, Spring Web, Spring Data JPA, Spring Security |
| Auth | JWT Bearer Token |
| Database | Oracle XE 11g |
| Frontend | React 18, Vite, React Router |
| API Docs | springdoc-openapi, Swagger UI |
| Build | Gradle, npm |

## 저장소 구조

```text
scsa-issue-tracker/
├── backend/                 # Spring Boot API 서버
├── frontend/                # React + Vite 프론트엔드
├── docs/
│   ├── api-contract.md      # API 계약 문서
│   ├── demo-scenario.md     # 시연 시나리오
│   ├── security-decisions.md
│   └── sql/
│       └── issue-status-contract-migration.sql
├── README.md
└── .gitignore
```

## 실행 방법

### 1. 백엔드 실행

Oracle XE가 실행 중이어야 합니다. 현재 개발 환경은 `hr/hr`, `jdbc:oracle:thin:@localhost:1521/xe` 기준입니다.

```bash
cd backend
./gradlew.bat bootRun
```

백엔드 기본 주소:

```text
http://localhost:8081
```

Swagger UI:

```text
http://localhost:8081/swagger-ui/index.html
```

Health Check:

```text
http://localhost:8081/api/health
```

### 2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드 기본 주소:

```text
http://localhost:5173
```

프론트엔드는 Vite proxy를 통해 `/api` 요청을 `http://localhost:8081` 백엔드로 전달합니다.

## 브랜치 전략

| 브랜치 | 용도 |
| --- | --- |
| `main` | 백엔드와 프론트가 통합된 최종 안정본 |
| `backend-dev` | 백엔드 개발 통합 브랜치 |
| `frontend-dev` | 프론트엔드 개발 통합 브랜치 |
| `feature/...` | 기능 단위 작업 브랜치 |

기능 개발은 `feature/...` 브랜치에서 진행한 뒤 PR로 `backend-dev` 또는 `frontend-dev`에 병합합니다. 통합 검증이 끝나면 `main`으로 병합합니다.

## 핵심 도메인

| 도메인 | 설명 |
| --- | --- |
| User | 시스템 사용자 |
| Auth | 로그인, JWT 발급, 현재 사용자 조회 |
| Project | 이슈를 묶는 협업 단위 |
| ProjectMember | 프로젝트 참여자와 역할 |
| Issue | 요청, 버그, 기능, 작업 단위 |
| Comment | 이슈에 대한 협업 기록 |

## Enum

### IssueType

```text
BUG / FEATURE / REQUEST / TASK
```

### IssueStatus

```text
OPEN / IN_PROGRESS / RESOLVED / CLOSED
```

### IssuePriority

```text
LOW / MEDIUM / HIGH / CRITICAL
```

### ProjectMemberRole

```text
OWNER / MEMBER
```

## 보안과 권한 설계

- 비밀번호는 BCrypt로 단방향 해시 저장합니다.
- 로그인 성공 시 JWT access token을 발급합니다.
- 프론트엔드는 `Authorization: Bearer <token>` 헤더로 인증 정보를 전달합니다.
- 프로젝트 생성자는 자동으로 `OWNER` 멤버가 됩니다.
- 프로젝트 멤버가 아닌 사용자는 해당 프로젝트의 이슈와 댓글에 접근할 수 없습니다.
- 이슈 담당자는 해당 프로젝트 멤버여야 합니다.
- 프로젝트 소유자는 제거할 수 없습니다.
- 자세한 결정 배경은 [security-decisions.md](docs/security-decisions.md)를 참고합니다.

## 문서

- [API 계약 문서](docs/api-contract.md)
- [시연 시나리오](docs/demo-scenario.md)
- [보안 설계 결정 기록](docs/security-decisions.md)
- [이슈 상태/타입 Oracle 마이그레이션 SQL](docs/sql/issue-status-contract-migration.sql)

## 현재 한계와 개선 후보

- Refresh Token은 아직 구현하지 않았습니다.
- DB 마이그레이션 자동화 도구는 아직 도입하지 않았습니다.
- 테스트 코드는 부족합니다.
- 댓글 수정/삭제는 아직 없습니다.
- 프로젝트 멤버 역할은 `OWNER`, `MEMBER` 두 단계만 제공합니다.
- 운영 환경에서는 JWT secret, DB 계정 정보를 환경변수 또는 Secret Manager로 분리해야 합니다.

## Contributors

- Park Si Woo
- Lee Ji Eon
- Na Danbi
- Lee Jae Won
