import { Clock, MapPin, Utensils } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EXAMPLE = {
  title: "도쿄 4박 5일 — 6세 아이와 떠나는 첫 일본 여행",
  highlights: ["우에노 공원·동물원", "지브리 박물관", "오다이바 가족 산책"],
  day: {
    label: "Day 2 · 시부야와 하라주쿠",
    items: [
      {
        time: "오전 9:30",
        title: "메이지 신궁 산책",
        place: "도쿄도 시부야구",
        type: "관광",
      },
      {
        time: "오전 11:30",
        title: "하라주쿠 키즈 메뉴 점심",
        place: "오모테산도",
        type: "식당",
      },
      {
        time: "오후 1:30",
        title: "시부야 거리 + 스크램블 교차로",
        place: "시부야역",
        type: "관광",
      },
      {
        time: "오후 4:00",
        title: "호텔 휴식",
        place: "시부야 호텔",
        type: "휴식",
      },
    ],
  },
};

export function ExampleItinerarySection() {
  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <Badge variant="info" className="mb-2 w-fit">예시 일정</Badge>
          <CardTitle className="text-xl md:text-2xl">{EXAMPLE.title}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLE.highlights.map((h) => (
              <Badge key={h} variant="outline">{h}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-muted/30 p-4 md:p-6">
            <h4 className="mb-4 text-sm font-semibold text-muted-foreground">
              {EXAMPLE.day.label}
            </h4>
            <ol className="relative space-y-4 border-l border-border pl-6">
              {EXAMPLE.day.items.map((item, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {item.time}
                    <span className="ml-1">·</span>
                    <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
                  </div>
                  <p className="mt-1 font-medium">{item.title}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {item.type === "식당" ? (
                      <Utensils className="h-3 w-3" />
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    {item.place}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
