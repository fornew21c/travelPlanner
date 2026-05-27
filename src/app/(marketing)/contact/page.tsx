import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "문의",
  description: "AI 패밀리 트래블 플래너에 대한 문의·제안·버그 신고를 받습니다.",
};

// TODO: 실제 문의용 이메일로 교체하세요.
const CONTACT_EMAIL = "support@aitravelplanner.app";

export default function ContactPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-16">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">문의하기</h1>
        <p className="text-muted-foreground">
          서비스 이용 중 궁금한 점, 개선 제안, 오류 신고 무엇이든 환영합니다. 보통 2&ndash;3일 내에
          답변드려요.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">이메일 문의</h2>
            <p className="text-sm text-muted-foreground">
              아래 주소로 메일을 보내주세요. 가능한 한 빠르게 답변드리겠습니다.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("[문의] AI 패밀리 트래블 플래너")}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">문의 전 확인</h2>
            <p className="text-sm text-muted-foreground">
              버그 신고 시 발생 화면, 사용 기기/브라우저, 재현 방법을 함께 적어주시면 더 빠르게 해결할 수
              있어요.
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        개인정보 처리에 관한 내용은 <a className="underline hover:text-foreground" href="/privacy">개인정보 처리방침</a>을,
        서비스 이용 조건은 <a className="underline hover:text-foreground" href="/terms">이용약관</a>을 참고해 주세요.
      </p>
    </div>
  );
}
