import { Quote } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const TESTIMONIALS = [
  {
    quote:
      "5살 아이와 처음 떠난 도쿄여행, 동선이 무리 없고 휴식 시간이 알맞게 들어가서 정말 편했어요.",
    name: "이지영",
    detail: "5세 자녀와 도쿄 4박",
  },
  {
    quote:
      "예산 안에서 맞춰주는 게 가장 좋았어요. 식당 추천도 한국인 입맛에 맞아서 만족도가 높았어요.",
    name: "박정훈",
    detail: "8세·11세 자녀와 다낭 5박",
  },
  {
    quote:
      "유모차 접근 가능 여부까지 표시해줘서 어디를 갈 때마다 미리 검색하지 않아도 됐어요.",
    name: "최은서",
    detail: "3세 자녀와 오사카 3박",
  },
];

export function TestimonialsSection() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <Card key={t.name} className="border-border/60">
          <CardContent className="space-y-4 p-6">
            <Quote className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-sm leading-relaxed text-foreground">{t.quote}</p>
            <div className="border-t border-border pt-3">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.detail}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
