"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "AI 일정 생성에 비용이 드나요?",
    a: "현재 베타 기간에는 무료로 제공됩니다. 추후 무료 플랜과 더 강력한 기능을 제공하는 유료 플랜으로 나누어 운영할 예정입니다.",
  },
  {
    q: "아이 나이를 입력하면 어떻게 반영되나요?",
    a: "유모차 접근, 키즈 메뉴 보유 식당, 휴식 빈도, 활동 강도 등을 자동으로 조정합니다. 7세 미만은 오후 휴식이 일정에 포함됩니다.",
  },
  {
    q: "생성된 일정을 수정할 수 있나요?",
    a: "물론입니다. 각 일정 항목을 드래그하여 순서를 바꾸거나, 시간/장소/비용을 직접 편집할 수 있습니다.",
  },
  {
    q: "공유 링크는 어떻게 동작하나요?",
    a: "여행 상세 페이지에서 공유 버튼을 누르면 읽기 전용 링크가 만들어집니다. 가족이나 동행자에게 보낼 수 있어요.",
  },
  {
    q: "데이터는 안전한가요?",
    a: "모든 데이터는 Supabase의 Row Level Security가 적용된 데이터베이스에 저장되며, 다른 사용자가 접근할 수 없습니다.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="space-y-3">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q} className="rounded-2xl border bg-card shadow-soft">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-base font-medium">{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
