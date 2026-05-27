import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "AI 패밀리 트래블 플래너 서비스 이용에 관한 약관입니다.",
};

const LAST_UPDATED = "2026년 5월 27일";
const CONTACT_EMAIL = "support@aitravelplanner.app";

export default function TermsPage() {
  return (
    <article className="container max-w-3xl py-12 md:py-16">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">이용약관</h1>
        <p className="text-sm text-muted-foreground">최종 수정일: {LAST_UPDATED}</p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20">
        <h2>제1조 (목적)</h2>
        <p>
          본 약관은 AI 패밀리 트래블 플래너(이하 &ldquo;서비스&rdquo;)가 제공하는 AI 기반 여행 일정
          생성 및 관련 기능의 이용 조건과 절차, 이용자와 서비스의 권리·의무를 규정함을 목적으로 합니다.
        </p>

        <h2>제2조 (서비스의 내용)</h2>
        <p>
          서비스는 이용자가 입력한 여행 조건을 바탕으로 AI를 활용해 여행 일정과 준비물 목록을 생성하고,
          이를 저장·조회·공유할 수 있는 기능을 제공합니다.
        </p>

        <h2>제3조 (계정)</h2>
        <ul>
          <li>이용자는 이메일 또는 구글 계정을 통해 회원으로 가입할 수 있습니다.</li>
          <li>이용자는 계정 정보를 정확하게 유지할 책임이 있으며, 계정의 무단 사용에 대한 책임은 이용자에게 있습니다.</li>
        </ul>

        <h2>제4조 (AI 생성 콘텐츠에 관한 고지)</h2>
        <p>
          AI가 생성한 여행 일정, 장소 정보, 예상 비용, 준비물 등은 <strong>참고용</strong>이며 정확성이나
          최신성을 보장하지 않습니다. 영업시간, 가격, 운영 여부, 교통편 등은 반드시 이용자가 직접
          확인해야 하며, 이를 신뢰하여 발생한 손해에 대해 서비스는 책임지지 않습니다.
        </p>

        <h2>제5조 (이용자의 의무)</h2>
        <ul>
          <li>법령 또는 본 약관을 위반하는 행위를 해서는 안 됩니다.</li>
          <li>서비스의 정상적인 운영을 방해하는 행위(과도한 자동 요청, 비정상적 접근 등)를 해서는 안 됩니다.</li>
          <li>타인의 권리를 침해하거나 부적절한 내용을 입력·공유해서는 안 됩니다.</li>
        </ul>

        <h2>제6조 (서비스의 변경 및 중단)</h2>
        <p>
          서비스는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며,
          이 경우 가능한 범위에서 사전에 공지합니다.
        </p>

        <h2>제7조 (책임의 제한)</h2>
        <p>
          서비스는 무료로 제공되는 범위에서 관련 법령이 허용하는 한도 내에서 책임을 부담합니다.
          천재지변, 외부 서비스(AI 제공자, 호스팅 등) 장애 등 서비스의 합리적 통제를 벗어난 사유로 인한
          손해에 대해서는 책임을 지지 않습니다.
        </p>

        <h2>제8조 (약관의 변경)</h2>
        <p>
          본 약관은 관련 법령에 따라 변경될 수 있으며, 변경 시 본 페이지를 통해 공지합니다. 변경 후
          서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 봅니다.
        </p>

        <h2>제9조 (문의)</h2>
        <p>
          약관 관련 문의는 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> 로 연락해 주세요.
        </p>
      </div>
    </article>
  );
}
