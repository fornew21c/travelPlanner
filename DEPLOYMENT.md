# 배포 가이드

## 1. Supabase 프로덕션 설정

### A. 새 프로젝트 만들기
1. https://supabase.com → New Project
2. Region: `Northeast Asia (Seoul)` 권장
3. 데이터베이스 비밀번호 안전한 곳에 저장

### B. 스키마 적용
SQL Editor → New Query → `supabase/migrations/0001_init.sql` 내용 붙여넣고 Run.

### C. 인증 설정
**Authentication → Providers:**
- ✅ Email: 활성화 (이메일 confirm 권장)
- ✅ Google:
  1. Google Cloud Console → APIs & Services → Credentials
  2. OAuth 2.0 Client ID 생성 (Web application)
  3. Authorized redirect URI:
     `https://<project-ref>.supabase.co/auth/v1/callback`
  4. Client ID/Secret을 Supabase에 입력

**Authentication → URL Configuration:**
- Site URL: `https://<your-domain>`
- Redirect URLs:
  ```
  https://<your-domain>/auth/callback
  http://localhost:3000/auth/callback
  ```

### D. API 키 확보
Project Settings → API:
- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` `secret` → `SUPABASE_SERVICE_ROLE_KEY` (서버 전용)

---

## 2. AI Provider API Key

### OpenAI (기본)
1. https://platform.openai.com/api-keys
2. `OPENAI_API_KEY` 발급
3. 모델은 기본 `gpt-4o-mini` (비용 효율) — 더 높은 품질이 필요하면 `gpt-4o` 권장
4. `AI_PROVIDER=openai` 로 설정

### Anthropic (옵션)
프로바이더 추상화가 되어 있어, 환경변수만 바꾸면 Claude로 전환할 수 있습니다.
1. https://console.anthropic.com → API Keys
2. `ANTHROPIC_API_KEY` 발급
3. `AI_PROVIDER=anthropic`, `ANTHROPIC_MODEL=claude-sonnet-4-6` 설정

---

## 3. Vercel 배포

### A. Project Import
1. https://vercel.com → New Project → Import Git Repo
2. Framework Preset: **Next.js** (자동 인식)
3. Root Directory: `.`

### B. Environment Variables
다음 모두 추가 (Production / Preview / Development):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AI_PROVIDER=openai
OPENAI_API_KEY            # 필수 (AI_PROVIDER=openai 일 때)
OPENAI_MODEL=gpt-4o-mini
# ANTHROPIC_API_KEY       # AI_PROVIDER=anthropic 으로 바꾸는 경우에만
# ANTHROPIC_MODEL
NEXT_PUBLIC_SITE_URL      # 배포 후 도메인으로 갱신
NEXT_PUBLIC_APP_NAME
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` 와 `*_API_KEY` 는 `NEXT_PUBLIC_` 접두사를 절대 붙이지 마세요. 서버 사이드에서만 사용됩니다.

### C. Deploy
- Push to `main` → 자동 프로덕션 배포
- PR → 자동 Preview 배포

### D. 배포 후 체크
- [ ] Google 로그인 가능
- [ ] 새 여행 생성 (AI 응답 수신)
- [ ] 공유 링크 정상 작동
- [ ] 모바일에서 BottomNav 표시
- [ ] 다크 모드 토글 동작

---

## 4. 운영 팁

### 비용 관리
- AI 호출이 가장 큰 비용. `temperature`, `maxTokens` 를 `lib/ai/index.ts` 에서 조정.
- 무료 사용량 제한을 두려면 `generateTripAction` 에 일일 quota 체크 추가:
  ```ts
  // 예시: 사용자당 일 5회 제한
  const { count } = await supabase
    .from("trips")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 86400000).toISOString());
  if ((count ?? 0) >= 5) return { error: "오늘 사용량을 모두 사용하셨어요" };
  ```

### 모니터링
- Vercel Analytics (Settings → Analytics) 활성화
- Supabase Logs → API 사용량 모니터링
- AI 호출 실패 알림은 Sentry/Logtail 등 추가 권장

### 백업
- Supabase Dashboard → Database → Backups (자동 daily)
- Production 에서는 PITR(Point-in-time Recovery) 활성화 권장

---

## 5. 도메인 연결

1. Vercel → Settings → Domains → Add `your-domain.com`
2. DNS A record / CNAME 설정
3. `NEXT_PUBLIC_SITE_URL` 갱신
4. Supabase Site URL / Redirect URL 도 같이 갱신
