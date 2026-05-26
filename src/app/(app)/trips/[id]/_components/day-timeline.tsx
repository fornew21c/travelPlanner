"use client";

import { motion } from "framer-motion";
import {
  Bed,
  Building2,
  Camera,
  Coffee,
  MapPin,
  StickyNote,
  Train,
  Utensils,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n";
import { formatDateFull, formatKRW, formatTimeString } from "@/lib/format";
import type { ItineraryDay, ItineraryItem, ItineraryItemType } from "@/lib/supabase/database.types";

const ICONS: Record<ItineraryItemType, React.ComponentType<{ className?: string }>> = {
  attraction: Camera,
  restaurant: Utensils,
  transport: Train,
  accommodation: Bed,
  activity: Building2,
  rest: Coffee,
  note: StickyNote,
};

interface DayTimelineProps {
  day: ItineraryDay;
  items: ItineraryItem[];
  dict: Dictionary;
}

export function DayTimeline({ day, items, dict }: DayTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Day {day.day_index} · {formatDateFull(day.date)}
            </p>
            <CardTitle>{day.title ?? `${day.day_index}일차`}</CardTitle>
          </div>
        </div>
        {day.summary && <p className="text-sm text-muted-foreground">{day.summary}</p>}
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-5 border-l border-border pl-6">
          {items.map((item, idx) => {
            const Icon = ICONS[item.type];
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25 }}
                className="relative"
              >
                <span className="absolute -left-[27px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {item.start_time && (
                    <span className="font-medium text-foreground">
                      {formatTimeString(item.start_time)}
                      {item.end_time ? ` – ${formatTimeString(item.end_time)}` : ""}
                    </span>
                  )}
                  <Badge variant="secondary" className="text-[10px]">
                    {dict.itemType[item.type]}
                  </Badge>
                  {item.child_friendly && (
                    <Badge variant="success" className="text-[10px]">
                      {dict.result.childFriendly}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-base font-medium">{item.title}</p>
                {item.location_name && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {item.location_name}
                    {item.address ? ` · ${item.address}` : ""}
                  </p>
                )}
                {item.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                )}
                {item.tips && (
                  <div className="mt-2 rounded-lg bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
                    💡 {item.tips}
                  </div>
                )}
                {item.estimated_cost_krw > 0 && (
                  <p className="mt-2 text-xs font-medium text-foreground/80">
                    예상 비용 · {formatKRW(item.estimated_cost_krw)}
                  </p>
                )}
                {item.type === "accommodation" && item.estimated_cost_krw === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    숙박비는 시즌·등급에 따라 변동이 커서 별도로 검색을 권장합니다.
                  </p>
                )}
              </motion.li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
