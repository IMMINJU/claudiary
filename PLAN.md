# claudiary — MVP 플랜

## Context

"당신의 Claude Code가 만들어주는 dev log" SaaS. 유저가 Claude Code에서 `/blog` 스킬을 실행하면 로컬 대화 기록을 읽고 블로그 글을 생성해서 claudiary 서버로 전송. 웹에서 글 관리/편집/공개.

포트폴리오용 프로젝트로, solvesk와 함께 "SaaS를 반복적으로 만들 수 있는 개발자" 이미지를 보여주는 것이 목표.

---

## 결정사항 요약

| 항목 | 결정 |
|------|------|
| 과금 | 완전 무료 (MVP) |
| 글 저장 | claudiary DB (서버) |
| URL 구조 | 서브패스: `/[locale]/blog/username/post-slug` |
| 민감정보 | 스킬에서 필터링 (서버는 관여 안 함) |
| 디자인 | 모던 SaaS + 클로드 감성 (claude.ai 스타일 워밍톤) |
| 비로그인 체험 | 샘플 대화→글 변환 데모 (API 호출 없음) |
| 자동화 | 없음. 유저가 수동으로 `/blog` 실행 |
| 원본 대화 | 서버에 저장 안 함. 가공된 글만 전송 |
| 다국어 | 영/한 (`en`, `ko`) — `next-intl` 사용 |

---

## 다국어 (i18n)

- **라이브러리:** `next-intl` (App Router 호환, SSR/SSG 모두 지원)
- **지원 언어:** `ko` (기본), `en`
- **URL 구조:** `/en/...`, `/ko/...` prefix
- **번역 범위:** UI 텍스트만 (유저 글 콘텐츠는 원본 그대로)
- **브라우저 감지:** Accept-Language 헤더로 자동 리다이렉트
- **번역 파일:** `messages/ko.json`, `messages/en.json`

---

## 영역별 MVP 정의

### 1. 기획

**유저 플로우:**
1. 랜딩 방문 → 샘플 데모로 컨셉 이해
2. GitHub 로그인
3. 대시보드에서 API Key 발급
4. 로컬 Claude Code에서 `/blog setup` → API Key 입력
5. `/blog` 실행 → 대화 분석 → 글 생성 → 미리보기 → 서버 전송 (draft)
6. 대시보드에서 확인/편집 → publish
7. `/blog/username/post-slug`에서 공개

**MVP 범위:**
- 포함: 인증, API Key, 글 CRUD, draft/published 상태, 퍼블릭 블로그, 랜딩, 다국어(영/한)
- 미포함: 댓글, 커스텀 도메인, 이미지 업로드, RSS, 통계, 테마 커스텀, 검색

### 2. 프론트엔드

**페이지 구성:**
- `/[locale]` — 랜딩 (SSG). 샘플 대화→글 변환 데모, CTA
- `/[locale]/login` — GitHub OAuth
- `/[locale]/dashboard` — 글 목록 (날짜별 그룹핑, 상태 필터)
- `/[locale]/dashboard/posts/[id]/edit` — 글 편집 (Markdown 에디터 + 라이브 프리뷰)
- `/[locale]/dashboard/settings` — 블로그 설정 (slug, 제목, 소개)
- `/[locale]/dashboard/api-keys` — API Key 관리
- `/[locale]/blog/[username]` — 퍼블릭 블로그 메인 (날짜별 그룹핑)
- `/[locale]/blog/[username]/[post-slug]` — 글 상세

**글 목록 UI (날짜별 그룹핑):**
```
2026-03-16
  ├─ Kubernetes 리소스 쿼터 디버깅  #k8s #debugging
  └─ Gmail API thread ID 함정      #google-api

2026-03-15
  └─ EventBus 인스턴스 이중 생성    #vue #architecture
```

**렌더링 전략:**
- 랜딩: SSG
- 대시보드: SSR + 클라이언트
- 퍼블릭 블로그: ISR (revalidate: 60)

### 3. 서버 (API)

**스킬용 API (`/api/v1/*`) — API Key 인증:**
- `POST /api/v1/posts` — 글 생성 (conversationId로 upsert)
- `GET /api/v1/posts` — 글 목록
- `GET /api/v1/posts/:id` — 글 상세
- `PATCH /api/v1/posts/:id` — 글 수정
- `DELETE /api/v1/posts/:id` — 글 삭제
- `GET /api/v1/me` — 연결 확인

**웹용 API (`/api/web/*`) — NextAuth 세션 인증:**
- API Key CRUD
- 글 편집/삭제/상태 변경
- 블로그 설정 수정

**인증 이원화:**
- 웹: GitHub OAuth (NextAuth v5 / Auth.js), JWT 세션
- 스킬→API: API Key (Bearer Token), SHA-256 해시 저장, `cldy_` prefix

**DB 스키마 (Drizzle + Vercel Postgres):**
- `users` — id, email, name, avatar_url, blog_slug (UNIQUE), blog_title, blog_description
- `api_keys` — id, user_id (FK), name, key_hash (UNIQUE), key_prefix, last_used_at
- `posts` — id, user_id (FK), title, slug, content (Markdown), excerpt, status (draft/published), source (skill/web), conversation_id (중복 방지), tags (TEXT[]), published_at
- NextAuth 테이블 (accounts, sessions 등 — Drizzle adapter 자동 생성)

### 4. 디자인

**톤앤매너:** 모던 SaaS + claude.ai 감성
- 베이지/오렌지 워밍톤 그라데이션
- 깔끔한 카드 레이아웃
- claude.ai 스타일의 따뜻하면서 세련된 느낌
- 다크모드: MVP에서 미포함, 라이트 모드만

**참고:** claude.ai UI, linear.app 레이아웃, vercel.com 랜딩

### 5. 보안

- API Key: 원본은 생성 시 1회만 노출, DB에 SHA-256 해시만 저장
- 민감정보: 스킬 프롬프트에서 필터링 지시 (API key, 비밀번호 등 제거)
- 글은 기본 draft → 유저 확인 후 publish
- XSS: Markdown → HTML 렌더링 시 sanitize (rehype-sanitize)
- Rate limiting: API Key당 분당 요청 제한 (MVP에서는 단순 구현)
- CORS: `/api/v1/*`은 스킬(curl)에서 호출하므로 CORS 불필요

### 6. 인프라

**스택:**
- Next.js 15 (App Router)
- next-intl (다국어)
- Drizzle ORM
- Vercel Postgres (Neon 기반)
- Vercel 배포 (서버리스)
- Tailwind CSS v4 + shadcn/ui

**Vercel 제한 고려:**
- 서버리스 함수 타임아웃: 10초 (Hobby) — 충분
- DB 커넥션: Neon 서버리스 드라이버 사용 (커넥션 풀링 불필요)
- 용량: Vercel Postgres Hobby 256MB — MVP 충분

### 7. 법적/프라이버시

- 원본 대화 기록은 서버에 저장하지 않음 (가공된 글만)
- 글 완전 삭제 기능 제공
- 이용약관/프라이버시 정책 페이지 (MVP에서 간단히)
- 랜딩에 "원본 대화는 저장하지 않습니다" 명시

---

## 개발 순서

각 단계: 구현 → 검증 항목 목록 → 테스트 작성 → 통과 확인

### Phase 1: 프로젝트 초기화 + DB
1. Next.js 프로젝트 생성 (TypeScript strict)
2. next-intl 설정 (ko/en, 메시지 파일, 미들웨어)
3. Drizzle ORM + Vercel Postgres 설정
4. DB 스키마 정의 (`users`, `api_keys`, `posts`)
5. 마이그레이션 생성/실행

### Phase 2: 인증
6. NextAuth v5 + GitHub OAuth + Drizzle adapter
7. 보호 라우트 미들웨어 (next-intl 미들웨어와 통합)
8. API Key 생성/해싱/검증 유틸 (`lib/api-key.ts`)
9. API Key CRUD 엔드포인트

### Phase 3: 핵심 API
10. `POST /api/v1/posts` (글 생성, upsert)
11. `GET /api/v1/posts` (목록)
12. `PATCH /api/v1/posts/:id` (수정, 상태 변경)
13. `DELETE /api/v1/posts/:id`
14. Zod 검증 + 에러 핸들링

### Phase 4: 대시보드 UI
15. 레이아웃 (사이드바 + 콘텐츠)
16. 글 목록 (날짜별 그룹핑, 상태 필터)
17. 글 편집 (Markdown 에디터 + 프리뷰)
18. API Key 관리 페이지
19. 블로그 설정 페이지

### Phase 5: 퍼블릭 블로그
20. `/[locale]/blog/[username]` 페이지 (ISR)
21. `/[locale]/blog/[username]/[post-slug]` 페이지 (ISR)
22. Markdown → HTML 렌더링 (remark/rehype + sanitize)

### Phase 6: 랜딩 + 마감
23. 랜딩 페이지 (샘플 데모, 영/한 버전)
24. 언어 전환 UI (헤더에 토글)
25. Vercel 배포
26. E2E 테스트 (Playwright, 핵심 플로우)

---

## 검증 방법

- **단위 테스트 (Vitest):** API Key 해싱/검증, Zod 스키마, 유틸 함수
- **통합 테스트 (Vitest):** API 엔드포인트 (인증 성공/실패, CRUD, upsert)
- **E2E 테스트 (Playwright):** 로그인 → API Key 발급 → 글 생성 → 편집 → 퍼블릭 확인
- **브라우저 검증:** Chrome DevTools MCP로 UI 동작 확인
