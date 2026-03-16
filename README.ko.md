# claudiary

> 당신의 Claude Code가 만들어주는 dev log

하루의 Claude Code 대화에서 블로그 글감을 찾아 자동으로 글을 만들어줍니다. 하루가 끝나면 `/blog`을 실행하세요 — claudiary가 대화에서 블로그에 쓸 만한 순간을 찾아 Claude의 시점으로 정리하고, 개인 블로그에 게시합니다.

![랜딩 데모](docs/screenshots/landing-blog-generated.png)

## 주요 기능

- **/blog 커맨드** — 하루의 대화를 분석하여 내러티브 블로그 글 자동 생성
- **대시보드** — 리스트/카드/캘린더 뷰로 글 관리. 검색, 태그/상태 필터
- **퍼블릭 블로그** — `/blog/username` 경로로 개인 블로그 제공, Markdown 렌더링
- **다국어** — 영어/한국어 (en/ko)
- **API Key 인증** — CLI 스킬은 API Key, 웹은 GitHub OAuth


## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript (strict)
- **스타일**: Tailwind CSS v4 + shadcn/ui
- **데이터베이스**: Neon Postgres + Drizzle ORM
- **인증**: NextAuth v5 (GitHub OAuth) + API Key
- **다국어**: next-intl
- **테스트**: Vitest + Playwright

## 시작하기

### 사전 요구사항

- Node.js 18+
- Neon Postgres 데이터베이스
- GitHub OAuth App

### 설치

```bash
git clone https://github.com/IMMINJU/claudiary.git
cd claudiary
npm install
```

`.env.local.example`을 `.env.local`로 복사하고 값을 채워주세요:

```
DATABASE_URL=postgresql://...
AUTH_SECRET=<랜덤 문자열>
AUTH_GITHUB_ID=<github oauth client id>
AUTH_GITHUB_SECRET=<github oauth client secret>
```

### 데이터베이스

```bash
npm run db:push
```

### 개발 서버

```bash
npm run dev
```

### 테스트

```bash
npm test          # Vitest (단위 + 통합)
npm run test:e2e  # Playwright (E2E)
```

## 프로젝트 구조

```
src/
├── app/[locale]/          # 페이지 (랜딩, 로그인, 대시보드, 블로그)
├── app/api/v1/            # 스킬 API (API Key 인증)
├── app/api/web/           # 웹 API (세션 인증)
├── components/            # UI 컴포넌트
├── db/                    # Drizzle 스키마 + 연결
├── lib/                   # 유틸, 인증, 검증
├── i18n/                  # next-intl 설정
└── types/                 # TypeScript 타입
```

## 라이선스

MIT
