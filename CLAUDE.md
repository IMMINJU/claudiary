# claudiary — 프로젝트 규칙

## 아키텍처 맵

```
src/
├── app/                        # Next.js App Router (UI 레이어만)
│   ├── [locale]/               # next-intl 로케일 라우트 (ko, en)
│   │   ├── layout.tsx          # 로케일 루트 레이아웃
│   │   ├── page.tsx            # 랜딩 페이지
│   │   ├── login/              # 로그인
│   │   ├── dashboard/          # 대시보드 (보호 라우트)
│   │   │   ├── page.tsx        # 글 목록
│   │   │   ├── posts/[id]/edit # 글 편집
│   │   │   ├── settings/       # 블로그 설정
│   │   │   └── api-keys/       # API Key 관리
│   │   └── blog/[username]/    # 퍼블릭 블로그 (ISR)
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth 핸들러
│   │   ├── v1/                 # 스킬용 API (API Key 인증)
│   │   │   ├── me/             # GET — 연결 확인
│   │   │   └── posts/          # GET (목록), POST (생성/upsert)
│   │   │       └── [id]/       # GET, PATCH, DELETE
│   │   └── web/                # 웹용 API (NextAuth 세션 인증)
│   │       ├── api-keys/       # GET (목록), POST (생성)
│   │       │   └── [id]/       # DELETE
│   │       ├── posts/[id]/     # PATCH (편집/상태변경), DELETE
│   │       └── settings/       # GET, PATCH (블로그 설정)
│   └── globals.css             # 디자인 토큰 (shadcn/ui CSS 변수)
│
├── components/
│   └── ui/                     # shadcn/ui 컴포넌트
│
├── db/
│   ├── schema.ts               # Drizzle 테이블 정의 (users, api_keys, posts)
│   └── index.ts                # Neon + Drizzle 연결
│
├── i18n/
│   ├── routing.ts              # 로케일 라우팅 설정 (ko, en)
│   └── request.ts              # 서버 요청별 로케일
│
├── lib/                        # 비즈니스 로직, 유틸리티
│   ├── utils.ts                # cn() — shadcn/ui 유틸
│   ├── constants.ts            # POST_STATUS, POST_SOURCE, API_KEY_PREFIX 등
│   ├── env.ts                  # 환경변수 타입 안전 접근
│   ├── api-response.ts         # successResponse(), errorResponse()
│   ├── slug.ts                 # generateSlug() — 제목→URL slug 변환
│   ├── markdown.ts             # renderMarkdown() — remark/rehype + sanitize
│   ├── auth/
│   │   ├── session.ts          # requireSession() — 웹 API 세션 인증
│   │   ├── api-key.ts          # generateApiKey(), hashApiKey(), verifyApiKey()
│   │   └── verify-api-key.ts   # requireApiKey() — v1 API Key 인증
│   └── validations/
│       └── post.ts             # createPostSchema, updatePostSchema (Zod)
│
├── types/
│   └── index.ts                # User, Post, ApiKey 등 (스키마에서 infer)
│
└── middleware.ts               # next-intl 미들웨어
```

## 코딩 규칙

### 디자인 토큰 (절대 준수)
- **색상 하드코딩 금지**: hex, rgb, oklch 값을 컴포넌트에 직접 쓰지 않는다
- shadcn/ui 시멘틱 클래스만 사용: `bg-primary`, `text-muted-foreground`, `border-border` 등
- 커스텀 색상이 필요하면 `globals.css`의 CSS 변수에 추가
- 디자인 톤: claude.ai 워밍톤 (베이지/오렌지 그라데이션)

### 타입
- DB 타입은 `src/types/index.ts`에서 스키마 infer로 관리
- API 요청/응답 타입도 여기에 추가
- `any` 사용 금지

### 상수
- 매직 넘버/스트링은 `src/lib/constants.ts`에 정의
- 글 상태: `POST_STATUS.DRAFT`, `POST_STATUS.PUBLISHED`
- 글 출처: `POST_SOURCE.SKILL`, `POST_SOURCE.WEB`

### API 구조
- **서비스/레포지토리 레이어 없음** — route handler에서 바로 Drizzle 쿼리
- `/api/v1/*`: 스킬용, `lib/auth/api-key.ts`로 API Key 인증
- `/api/web/*`: 웹용, `lib/auth/session.ts`로 NextAuth 세션 인증
- 엔드포인트 20개 미만이므로 추상화 레이어 불필요, 추가하지 말 것

### API 응답
- `src/lib/api-response.ts`의 `successResponse()`, `errorResponse()` 사용
- 직접 `NextResponse.json()` 호출하지 않음

### 환경변수
- `src/lib/env.ts`를 통해 접근 (런타임 검증 포함)
- `process.env.XXX` 직접 접근은 `env.ts` 내부에서만

### 유틸리티 함수
- 새 유틸 추가 시 이 CLAUDE.md의 아키텍처 맵도 업데이트
- 기존 유틸이 있는지 먼저 확인 후 작성 (중복 방지)

### 다국어
- UI 텍스트는 `messages/ko.json`, `messages/en.json`에서 관리
- 컴포넌트에 한국어/영어 문자열 하드코딩 금지
- `useTranslations()` 또는 서버에서 `getTranslations()` 사용

### 패키지
- CSS: Tailwind v4 + shadcn/ui (CSS 변수 기반)
- ORM: Drizzle + Neon serverless
- i18n: next-intl
- 인증: NextAuth v5 (Auth.js)
