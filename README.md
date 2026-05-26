# AI 패밀리 트래블 플래너 (AI Family Travel Planner)

AI가 가족 맞춤 해외여행 일정을 1분 안에 생성해주는 프리미엄 SaaS 웹 앱.

> 한국 가족(특히 아이를 동반한 부모)을 위한 모바일 우선 디자인, Apple/Airbnb 스타일의 프리미엄 UX.

---

## 🚀 빠른 시작

```bash
# 1. 의존성 설치
npm install        # 또는 pnpm install / yarn

# 2. 환경 변수 설정
cp .env.example .env.local
#   → Supabase URL/Key, AI API Key를 입력

# 3. 데이터베이스 초기화 (아래 'Supabase 셋업' 참고)

# 4. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

---

## 📦 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 프론트엔드 | Next.js 15 (App Router) · React 19 · TypeScript |
| UI | Tailwind CSS · shadcn/ui 스타일 컴포넌트 · Radix Primitives · Framer Motion · Lucide |
| 백엔드 | Supabase (Postgres + Auth + RLS + Storage) |
| AI | OpenAI GPT (기본) / Anthropic Claude (옵션, 추상화로 전환 가능) |
| 폼/검증 | React Hook Form · Zod |
| 상태 | TanStack Query (옵션) · RSC + Server Actions |
| 배포 | Vercel |

---

## 🏗 아키텍처 개요

```
src/
├─ app/
│  ├─ (marketing)/         # 공개 랜딩, 푸터
│  │  ├─ page.tsx
│  │  └─ _components/      # FAQ, Testimonials, Example
│  ├─ (auth)/              # 로그인/가입
│  │  └─ _components/      # AuthForm, GoogleButton
│  ├─ (app)/               # 인증 필요한 영역
│  │  ├─ dashboard/        # 대시보드
│  │  ├─ planner/          # 새 여행 만들기 (Server Action으로 AI 호출)
│  │  ├─ trips/            # 저장된 여행 목록
│  │  ├─ trips/[id]/       # 여행 상세 (편집 가능)
│  │  └─ settings/         # 설정
│  ├─ s/[token]/           # 공유 링크(공개 읽기)
│  └─ auth/callback/       # Supabase OAuth/이메일 콜백
├─ components/
│  ├─ ui/                  # shadcn 스타일 프리미티브
│  └─ layout/              # SiteHeader, BottomNav, Footer
├─ lib/
│  ├─ ai/                  # 프로바이더 추상화
│  │  ├─ providers/        # anthropic.ts / openai.ts
│  │  ├─ prompts.ts        # 중앙 프롬프트 관리
│  │  ├─ schema.ts         # Zod 응답 스키마
│  │  └─ index.ts          # 공개 API
│  ├─ supabase/            # server/client/middleware
│  ├─ i18n/                # 한국어/영어 dictionary
│  ├─ format.ts            # KRW, 날짜 포맷터
│  └─ validations/         # 폼 스키마
├─ middleware.ts            # 세션 갱신 + 보호 라우트
└─ supabase/migrations/0001_init.sql
```

### 핵심 설계 결정

1. **RSC 우선 + Server Action**
   - 데이터 조회는 모두 Server Component에서 직접 Supabase를 호출 → 클라이언트 번들 최소화
   - 폼 제출/AI 호출은 Server Action 사용 → 별도 API 라우트 불필요
2. **AI 프로바이더 추상화 (`lib/ai`)**
   - `AIProvider` 인터페이스 + 어댑터 패턴
   - 응답은 항상 Zod 스키마로 검증된 구조화 JSON
   - `AI_PROVIDER=anthropic|openai`로 런타임 전환
3. **i18n 확장 준비**
   - dictionary 기반 (`ko`, `en`), 쿠키로 locale 결정
   - 향후 `[locale]` 동적 라우트로 마이그레이션 가능한 구조
4. **RLS 우선 보안**
   - 모든 사용자 데이터 테이블에 `user_id = auth.uid()` 정책
   - 공유 기능은 `share_token IS NOT NULL` 조건으로 익명 읽기 허용
5. **모바일 우선 UX**
   - BottomNav (모바일) ↔ 헤더 네비 (데스크탑)
   - Sticky CTA, thumb-friendly spacing, swipe 가능 카드

---

## 🗄 Supabase 셋업

### 1. 프로젝트 생성
[supabase.com](https://supabase.com) 에서 새 프로젝트를 만듭니다.

### 2. 스키마 적용
```bash
# Supabase CLI 사용 (권장)
supabase db push

# 또는 SQL Editor에서 직접 실행
# supabase/migrations/0001_init.sql 파일 내용을 그대로 실행
```

### 3. Google OAuth 활성화
1. Supabase Dashboard → Authentication → Providers → Google 활성화
2. Google Cloud Console에서 OAuth Client 만들고 Client ID/Secret 등록
3. 승인된 리다이렉트 URI:
   - `https://<your-project>.supabase.co/auth/v1/callback`

### 4. (선택) 타입 자동 생성
```bash
export SUPABASE_PROJECT_ID=your-project-id
npm run db:types
```

---

## 🔑 환경 변수

`.env.example` 참고. 핵심:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # 서버 전용. 절대 노출 금지.

AI_PROVIDER=openai                    # 기본값 (또는 anthropic)
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
# ANTHROPIC_API_KEY=...               # AI_PROVIDER=anthropic 으로 바꿀 때만 필요
# ANTHROPIC_MODEL=claude-sonnet-4-6

NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 🎨 폰트 (Pretendard)

한국어 가독성을 위해 [Pretendard](https://github.com/orioncactus/pretendard) 폰트를 self-host 합니다. `public/fonts/` 에 다음 파일을 넣어주세요:

```
public/fonts/Pretendard-Regular.woff2
public/fonts/Pretendard-Medium.woff2
public/fonts/Pretendard-SemiBold.woff2
public/fonts/Pretendard-Bold.woff2
```

> 폰트가 없어도 system-ui로 자동 fallback 됩니다.

---

## ☁️ Vercel 배포

### 자동 배포 (권장)
1. GitHub repo 연결
2. Vercel Project Settings → Environment Variables 에 위 환경변수 모두 추가
3. `NEXT_PUBLIC_SITE_URL` 을 배포 도메인으로 갱신
4. Push 시 자동 배포

### CLI 배포
```bash
npm i -g vercel
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... 나머지 env 변수
vercel deploy --prod
```

### Supabase 콜백 URL 등록
Vercel 배포 후 Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: `https://your-domain.com/auth/callback`

---

## 🧪 개발 워크플로

```bash
npm run dev          # 개발 서버 (turbo)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버
npm run typecheck    # TS 타입 체크
npm run lint         # ESLint
npm run format       # Prettier
```

---

## 🤖 AI 동작 원리

1. 사용자가 플래너 폼 제출
2. `generateTripAction` (Server Action) 실행
3. Supabase에 draft trip insert
4. `generateItinerary()` + `generatePackingList()` 병렬 호출
   - 기본 프로바이더는 OpenAI (`AI_PROVIDER=openai`), `response_format: json_object` 강제
   - `AI_PROVIDER=anthropic` 으로 바꾸면 Claude 사용
   - 응답은 Zod로 schema 검증
5. itinerary_days → itinerary_items → packing_items 순서로 저장
6. trip status를 `generated` 로 업데이트
7. `/trips/[id]` 로 리다이렉트

### 프로바이더 추가하기
`src/lib/ai/providers/` 에 어댑터 추가 후 `src/lib/ai/index.ts` 의 `getProvider()` 에 분기 추가하면 끝입니다.

---

## 📋 데이터 모델

```
profiles ── 1:1 ── auth.users
trips ─────┬── 1:N ── itinerary_days ── 1:N ── itinerary_items
           ├── 1:1 ── packing_lists ── 1:N ── packing_items
           └── 1:N ── favorites
```

모든 테이블에 RLS 적용, 자세한 정책은 `supabase/migrations/0001_init.sql` 참고.

---

## 🎯 TODO / 확장 아이디어

- [ ] 일정 항목 드래그&드롭 재정렬 (dnd-kit)
- [ ] PDF 내보내기 (react-pdf 또는 puppeteer)
- [ ] 환율/날씨 API 통합
- [ ] 호텔/항공 검색 연동
- [ ] 가족 멤버 협업(공동 편집)
- [ ] 푸시 알림 (출발 D-1 알림)

---

## 📄 라이선스

MIT
