import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: "AI 패밀리 트래블 플래너의 개인정보 수집·이용·보관에 대한 안내입니다.",
};

const LAST_UPDATED = "2026년 5월 27일";
// TODO: 실제 운영자명·연락처로 교체하세요.
const OPERATOR = "AI 패밀리 트래블 플래너 운영팀";
const CONTACT_EMAIL = "support@aitravelplanner.app";

export default function PrivacyPage() {
  return (
    <article className="container max-w-3xl py-12 md:py-16">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">개인정보 처리방침</h1>
        <p className="text-sm text-muted-foreground">최종 수정일: {LAST_UPDATED}</p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20">
        <p>
          {OPERATOR}(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 중요하게 생각하며,
          「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 서비스가 어떤 정보를 수집하고
          어떻게 이용·보관하는지를 설명합니다.
        </p>

        <h2>1. 수집하는 개인정보 항목</h2>
        <ul>
          <li>
            <strong>계정 정보</strong>: 이메일 주소, 표시 이름, 프로필 이미지(구글 로그인 시 제공되는
            정보에 한함)
          </li>
          <li>
            <strong>여행 계획 정보</strong>: 목적지, 여행 일정, 예산, 동행 인원(성인/아동 수 및 아동
            연령), 여행 취향, 메모 등 이용자가 직접 입력한 정보
          </li>
          <li>
            <strong>자동 수집 정보</strong>: 접속 로그, 쿠키(세션 유지용)
          </li>
        </ul>

        <h2>2. 개인정보의 이용 목적</h2>
        <ul>
          <li>회원 인증 및 로그인 상태 유지</li>
          <li>AI 기반 맞춤 여행 일정 및 준비물 목록 생성</li>
          <li>생성된 여행의 저장·조회·공유 기능 제공</li>
          <li>서비스 개선 및 오류 대응</li>
        </ul>

        <h2>3. 처리 위탁 및 제3자 제공</h2>
        <p>
          서비스는 기능 제공을 위해 다음의 외부 처리자를 이용합니다. 이용자의 입력 정보는 해당 목적
          범위 내에서만 처리됩니다.
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — 데이터베이스·인증·저장(데이터 호스팅)
          </li>
          <li>
            <strong>Vercel</strong> — 애플리케이션 호스팅·배포
          </li>
          <li>
            <strong>OpenAI / Anthropic</strong> — 여행 일정 생성을 위한 AI 처리(입력한 여행 조건이
            전송됨)
          </li>
          <li>
            <strong>Google</strong> — 소셜 로그인(이용자가 선택한 경우)
          </li>
        </ul>

        <h2>4. 보유 및 이용 기간</h2>
        <p>
          개인정보는 회원 탈퇴 시 또는 수집·이용 목적 달성 시까지 보유하며, 이후 지체 없이 파기합니다.
          이용자는 언제든지 자신의 여행 데이터를 삭제할 수 있습니다.
        </p>

        <h2>5. 이용자의 권리</h2>
        <p>
          이용자는 자신의 개인정보에 대해 열람·정정·삭제·처리정지를 요청할 수 있으며, 서비스 내 설정
          또는 아래 연락처를 통해 행사할 수 있습니다.
        </p>

        <h2>6. 쿠키</h2>
        <p>
          서비스는 로그인 세션 유지를 위해 필수 쿠키를 사용합니다. 브라우저 설정을 통해 쿠키 저장을
          거부할 수 있으나, 이 경우 로그인 등 일부 기능이 제한될 수 있습니다.
        </p>

        <h2>7. 문의처</h2>
        <p>
          개인정보 관련 문의는 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> 로 연락해
          주세요.
        </p>

        <hr />
        <p className="text-sm text-muted-foreground">
          본 방침은 서비스 정책 변경에 따라 수정될 수 있으며, 변경 시 본 페이지를 통해 공지합니다.
        </p>
      </div>
    </article>
  );
}
