# SCSA Issue Tracker API 계약 문서

이 문서는 웹 프론트엔드와 Android 클라이언트가 공통으로 참고할 API 계약입니다.

## 기본 정보

Base URL:

```text
http://localhost:8081/api/v1
```

Swagger UI:

```text
http://localhost:8081/swagger-ui/index.html
```

인증이 필요한 API는 다음 헤더를 사용합니다.

```http
Authorization: Bearer <accessToken>
```

## 공통 원칙

- 요청과 응답은 JSON을 사용합니다.
- 날짜/시간은 `LocalDateTime` JSON 문자열로 응답합니다.
- 클라이언트는 `userId`, `createdById`, `reporterId`, `authorId`를 임의로 보내지 않습니다.
- 현재 사용자는 JWT에서 서버가 판단합니다.
- 프로젝트 하위 자원은 프로젝트 멤버만 접근할 수 있습니다.
- 이슈 생성 시 상태는 서버가 `OPEN`으로 지정합니다.
- 이슈 상태 변경은 전용 API를 사용합니다.

## Enum

### IssueType

```text
BUG
FEATURE
REQUEST
TASK
```

### IssueStatus

```text
OPEN
IN_PROGRESS
RESOLVED
CLOSED
```

### IssuePriority

```text
LOW
MEDIUM
HIGH
CRITICAL
```

### ProjectMemberRole

```text
OWNER
MEMBER
```

## 에러 응답

예시:

```json
{
  "timestamp": "2026-05-22T11:20:00",
  "status": 403,
  "error": "Forbidden",
  "code": "FORBIDDEN",
  "message": "권한이 없습니다.",
  "path": "/api/v1/projects/1"
}
```

주요 상태 코드:

| Status | 의미 |
| --- | --- |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 또는 로그인 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 중복 또는 충돌 |
| 500 | 서버 내부 오류 |

## Auth API

### 로그인

```http
POST /auth/login
```

인증: 불필요

Request:

```json
{
  "username": "demo_owner",
  "password": "1234"
}
```

Response:

```json
{
  "tokenType": "Bearer",
  "accessToken": "..."
}
```

주요 상태 코드:

| Status | 의미 |
| --- | --- |
| 200 | 로그인 성공 |
| 400 | 요청 값 검증 실패 |
| 401 | 아이디 또는 비밀번호 불일치 |

### 현재 사용자 조회

```http
GET /auth/me
```

인증: 필요

Response:

```json
{
  "userId": 1,
  "username": "demo_owner"
}
```

## User API

### 회원가입

```http
POST /users
```

인증: 불필요

Request:

```json
{
  "username": "demo_owner",
  "email": "demo_owner@example.com",
  "password": "1234"
}
```

Response:

```json
{
  "id": 1,
  "username": "demo_owner",
  "email": "demo_owner@example.com",
  "createdAt": "2026-05-22T11:20:00"
}
```

주요 상태 코드:

| Status | 의미 |
| --- | --- |
| 201 | 회원가입 성공 |
| 400 | 요청 값 검증 실패 |
| 409 | username 또는 email 중복 |

### 사용자 목록 조회

```http
GET /users
```

인증: 필요

Response:

```json
[
  {
    "id": 1,
    "username": "demo_owner",
    "email": "demo_owner@example.com",
    "createdAt": "2026-05-22T11:20:00"
  }
]
```

## Project API

### 내 프로젝트 목록 조회

```http
GET /projects
```

인증: 필요

Response:

```json
[
  {
    "id": 1,
    "createdById": 1,
    "name": "SCSA 운영 개선",
    "description": "조직 공통 요청과 이슈를 관리하는 프로젝트",
    "createdAt": "2026-05-22T11:20:00",
    "updatedAt": "2026-05-22T11:20:00"
  }
]
```

주의:

- `userId` 쿼리 파라미터를 받지 않습니다.
- 서버가 JWT에서 현재 사용자를 확인합니다.

### 프로젝트 생성

```http
POST /projects
```

인증: 필요

Request:

```json
{
  "name": "SCSA 운영 개선",
  "description": "조직 공통 요청과 이슈를 관리하는 프로젝트"
}
```

Response:

```json
{
  "id": 1,
  "createdById": 1,
  "name": "SCSA 운영 개선",
  "description": "조직 공통 요청과 이슈를 관리하는 프로젝트",
  "createdAt": "2026-05-22T11:20:00",
  "updatedAt": "2026-05-22T11:20:00"
}
```

주요 상태 코드:

| Status | 의미 |
| --- | --- |
| 201 | 생성 성공 |
| 400 | 요청 값 검증 실패 |
| 409 | 같은 사용자의 프로젝트 이름 중복 |

### 프로젝트 상세 조회

```http
GET /projects/{projectId}
```

인증: 필요

Response:

```json
{
  "id": 1,
  "createdById": 1,
  "name": "SCSA 운영 개선",
  "description": "조직 공통 요청과 이슈를 관리하는 프로젝트",
  "createdAt": "2026-05-22T11:20:00",
  "updatedAt": "2026-05-22T11:20:00"
}
```

## Project Member API

### 멤버 추가

```http
POST /projects/{projectId}/members
```

인증: 필요

권한: 프로젝트 `OWNER`

Request:

```json
{
  "username": "demo_member"
}
```

Response:

```json
{
  "id": 1,
  "projectId": 1,
  "userId": 2,
  "username": "demo_member",
  "role": "MEMBER",
  "createdAt": "2026-05-22T11:20:00"
}
```

주요 상태 코드:

| Status | 의미 |
| --- | --- |
| 201 | 추가 성공 |
| 403 | OWNER 권한 없음 |
| 404 | 프로젝트 또는 사용자 없음 |
| 409 | 이미 참여 중인 사용자 |

### 멤버 목록 조회

```http
GET /projects/{projectId}/members
```

인증: 필요

Response:

```json
[
  {
    "id": 1,
    "projectId": 1,
    "userId": 1,
    "username": "demo_owner",
    "role": "OWNER",
    "createdAt": "2026-05-22T11:20:00"
  }
]
```

### 멤버 제거

```http
DELETE /projects/{projectId}/members/{userId}
```

인증: 필요

권한: 프로젝트 `OWNER`

Response:

```text
204 No Content
```

주의:

- 프로젝트 소유자는 제거할 수 없습니다.

## Issue API

### 이슈 생성

```http
POST /projects/{projectId}/issues
```

인증: 필요

Request:

```json
{
  "assigneeId": 2,
  "title": "월간 리포트 데이터 검증 요청",
  "content": "5월 매출 리포트의 일부 지표가 이전 데이터와 맞지 않아 확인이 필요합니다.",
  "issueType": "REQUEST",
  "priority": "MEDIUM"
}
```

Response:

```json
{
  "id": 1,
  "projectId": 1,
  "reporterId": 1,
  "assigneeId": 2,
  "title": "월간 리포트 데이터 검증 요청",
  "content": "5월 매출 리포트의 일부 지표가 이전 데이터와 맞지 않아 확인이 필요합니다.",
  "issueType": "REQUEST",
  "status": "OPEN",
  "priority": "MEDIUM",
  "createdAt": "2026-05-22T11:20:00",
  "updatedAt": "2026-05-22T11:20:00"
}
```

주의:

- `reporterId`는 보내지 않습니다.
- `status`는 보내지 않습니다.
- 서버가 `reporterId`를 현재 사용자로 설정합니다.
- 서버가 `status`를 `OPEN`으로 설정합니다.
- `assigneeId`는 프로젝트 멤버여야 합니다.

### 이슈 목록 조회

```http
GET /projects/{projectId}/issues
```

인증: 필요

Query Parameters:

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `status` | no | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` |
| `issueType` | no | `BUG`, `FEATURE`, `REQUEST`, `TASK` |
| `priority` | no | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `page` | no | 페이지 번호, 기본 `0` |
| `size` | no | 페이지 크기 |
| `sort` | no | 예: `createdAt,desc` |

Response:

```json
{
  "content": [
    {
      "id": 1,
      "projectId": 1,
      "reporterId": 1,
      "assigneeId": 2,
      "title": "월간 리포트 데이터 검증 요청",
      "content": "5월 매출 리포트의 일부 지표가 이전 데이터와 맞지 않아 확인이 필요합니다.",
      "issueType": "REQUEST",
      "status": "OPEN",
      "priority": "MEDIUM",
      "createdAt": "2026-05-22T11:20:00",
      "updatedAt": "2026-05-22T11:20:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0,
  "size": 20
}
```

Spring Page 응답이므로 실제 응답에는 `pageable`, `sort`, `first`, `last` 등의 필드가 추가될 수 있습니다.

### 이슈 상세 조회

```http
GET /projects/{projectId}/issues/{issueId}
```

인증: 필요

Response: `IssueResponse`

### 이슈 수정

```http
PATCH /projects/{projectId}/issues/{issueId}
```

인증: 필요

Request:

```json
{
  "assigneeId": 2,
  "title": "월간 리포트 데이터 검증 요청 수정",
  "content": "데이터 범위를 다시 확인해야 합니다.",
  "issueType": "REQUEST",
  "priority": "HIGH"
}
```

주의:

- 변경할 필드만 보낼 수 있습니다.
- `status`는 이 API로 변경하지 않습니다.

### 이슈 상태 변경

```http
PATCH /projects/{projectId}/issues/{issueId}/status
```

인증: 필요

Request:

```json
{
  "status": "RESOLVED"
}
```

Response: `IssueResponse`

### 이슈 삭제

```http
DELETE /projects/{projectId}/issues/{issueId}
```

인증: 필요

Response:

```text
204 No Content
```

## Comment API

### 댓글 작성

```http
POST /projects/{projectId}/issues/{issueId}/comments
```

인증: 필요

Request:

```json
{
  "content": "원본 데이터와 비교해보겠습니다."
}
```

Response:

```json
{
  "id": 1,
  "authorId": 1,
  "issueId": 1,
  "content": "원본 데이터와 비교해보겠습니다.",
  "createdAt": "2026-05-22T11:20:00",
  "updatedAt": "2026-05-22T11:20:00"
}
```

주의:

- `authorId`는 보내지 않습니다.
- 서버가 JWT에서 현재 사용자를 작성자로 설정합니다.

### 댓글 목록 조회

```http
GET /projects/{projectId}/issues/{issueId}/comments
```

인증: 필요

Query Parameters:

| 이름 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `limit` | no | `20` | 1 이상 100 이하 |
| `offset` | no | `0` | 0 이상 |

Response:

```json
{
  "items": [
    {
      "id": 1,
      "authorId": 1,
      "issueId": 1,
      "content": "원본 데이터와 비교해보겠습니다.",
      "createdAt": "2026-05-22T11:20:00",
      "updatedAt": "2026-05-22T11:20:00"
    }
  ],
  "total": 1
}
```

## Android 연동 메모

Android 클라이언트도 웹과 같은 API 계약을 사용하면 됩니다.

권장 방식:

- 로그인 후 `accessToken`을 안전한 저장소에 저장합니다.
- 인증 API 호출 시 `Authorization: Bearer <accessToken>` 헤더를 붙입니다.
- `401` 응답을 받으면 로그인 화면으로 이동합니다.
- `403` 응답은 권한 없음 안내로 처리합니다.
- enum 문자열은 앱 내부 enum과 1:1로 매핑합니다.

주의:

- 클라이언트에서 사용자 ID를 임의로 바꿔 보내는 방식은 사용하지 않습니다.
- 프로젝트, 이슈, 댓글 권한 판단은 서버가 합니다.
