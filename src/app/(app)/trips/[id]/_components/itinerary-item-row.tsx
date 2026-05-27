"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Bed,
  Building2,
  Camera,
  Check,
  Coffee,
  ExternalLink,
  Loader2,
  MapPin,
  Pencil,
  StickyNote,
  Train,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buildHotelSearchUrl } from "@/lib/affiliate";
import type { Dictionary } from "@/lib/i18n";
import { formatKRW, formatTimeString } from "@/lib/format";
import type { ItineraryItem, ItineraryItemType } from "@/lib/supabase/database.types";

import { updateItineraryItemAction, type ItemUpdateInput } from "../actions";

/** Trip context used to pre-fill the hotel-search link on accommodation items. */
export interface HotelSearchContext {
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
}

const ICONS: Record<ItineraryItemType, React.ComponentType<{ className?: string }>> = {
  attraction: Camera,
  restaurant: Utensils,
  transport: Train,
  accommodation: Bed,
  activity: Building2,
  rest: Coffee,
  note: StickyNote,
};

const TYPES: ItineraryItemType[] = [
  "attraction",
  "restaurant",
  "transport",
  "accommodation",
  "activity",
  "rest",
  "note",
];

// Postgres `time` comes back as "HH:MM:SS"; <input type="time"> wants "HH:MM".
const toTimeInput = (t: string | null) => (t ? t.slice(0, 5) : "");

// "다운타운 LA 인근 숙소" → "다운타운 LA". Strip the Korean qualifier words the AI
// appends to a stay AREA so the booking site gets a clean, searchable location.
function cleanStayQuery(raw: string): string {
  return raw
    .replace(/(인근|근처|주변|일대|지역|추천|숙소|호텔들?)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Add N days to an ISO date ("YYYY-MM-DD") without timezone drift.
function addDaysISO(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

interface ItineraryItemRowProps {
  item: ItineraryItem;
  idx: number;
  dict: Dictionary;
  /** When true (owner view), show edit affordance. Omitted on the public share page. */
  editable?: boolean;
  tripId?: string;
  /** Enables the hotel-search link on accommodation items. */
  hotelContext?: HotelSearchContext;
  /** This item's day date ("YYYY-MM-DD"); used to scope the hotel link to one night. */
  dayDate?: string;
}

export function ItineraryItemRow({
  item,
  idx,
  dict,
  editable,
  tripId,
  hotelContext,
  dayDate,
}: ItineraryItemRowProps) {
  const [editing, setEditing] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const Icon = ICONS[item.type];

  if (editing && editable && tripId) {
    return (
      <li className="relative">
        <span className="absolute -left-[27px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-background">
          <Pencil className="h-2.5 w-2.5" />
        </span>
        <ItemEditForm
          item={item}
          tripId={tripId}
          dict={dict}
          pending={pending}
          onCancel={() => setEditing(false)}
          onSave={(values) => {
            startTransition(async () => {
              try {
                await updateItineraryItemAction(item.id, tripId, values);
                toast.success("항목을 수정했어요");
                setEditing(false);
              } catch (err) {
                toast.error((err as Error).message);
              }
            });
          }}
        />
      </li>
    );
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.25 }}
      className="group relative"
    >
      <span className="absolute -left-[27px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
        <Icon className="h-2.5 w-2.5" />
      </span>

      {editable && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="항목 편집"
          className="absolute right-0 top-0 h-7 w-7 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}

      <div className="flex flex-wrap items-center gap-2 pr-8 text-xs text-muted-foreground">
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
      {item.type === "accommodation" && hotelContext && (
        <a
          href={buildHotelSearchUrl({
            // Use this day's stay area (cleaned) and a 1-night window from the
            // day's date — not the whole multi-city trip span.
            query: cleanStayQuery(item.location_name || "") || hotelContext.destination,
            checkIn: dayDate ?? hotelContext.startDate,
            checkOut: dayDate ? addDaysISO(dayDate, 1) : hotelContext.endDate,
            adults: hotelContext.adults,
            children: hotelContext.children,
          })}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
        >
          <Bed className="h-3.5 w-3.5" /> 이 지역 호텔 가격·예약 보기
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </motion.li>
  );
}

function ItemEditForm({
  item,
  dict,
  pending,
  onCancel,
  onSave,
}: {
  item: ItineraryItem;
  tripId: string;
  dict: Dictionary;
  pending: boolean;
  onCancel: () => void;
  onSave: (values: ItemUpdateInput) => void;
}) {
  const [type, setType] = React.useState<ItineraryItemType>(item.type);
  const [childFriendly, setChildFriendly] = React.useState(item.child_friendly);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      title: String(fd.get("title") ?? ""),
      type,
      start_time: String(fd.get("start_time") ?? ""),
      end_time: String(fd.get("end_time") ?? ""),
      location_name: String(fd.get("location_name") ?? ""),
      description: String(fd.get("description") ?? ""),
      tips: String(fd.get("tips") ?? ""),
      estimated_cost_krw: Number(fd.get("estimated_cost_krw") ?? 0),
      child_friendly: childFriendly,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`title-${item.id}`}>제목</Label>
          <Input id={`title-${item.id}`} name="title" defaultValue={item.title} required />
        </div>

        <div className="space-y-1.5">
          <Label>유형</Label>
          <Select value={type} onValueChange={(v) => setType(v as ItineraryItemType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {dict.itemType[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`loc-${item.id}`}>장소</Label>
          <Input
            id={`loc-${item.id}`}
            name="location_name"
            defaultValue={item.location_name ?? ""}
            placeholder="예: 후쿠오카 타워"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`start-${item.id}`}>시작 시간</Label>
          <Input
            id={`start-${item.id}`}
            name="start_time"
            type="time"
            defaultValue={toTimeInput(item.start_time)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`end-${item.id}`}>종료 시간</Label>
          <Input
            id={`end-${item.id}`}
            name="end_time"
            type="time"
            defaultValue={toTimeInput(item.end_time)}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`desc-${item.id}`}>설명</Label>
          <Textarea
            id={`desc-${item.id}`}
            name="description"
            defaultValue={item.description ?? ""}
            rows={2}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`tips-${item.id}`}>팁</Label>
          <Input id={`tips-${item.id}`} name="tips" defaultValue={item.tips ?? ""} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`cost-${item.id}`}>예상 비용 (원)</Label>
          <Input
            id={`cost-${item.id}`}
            name="estimated_cost_krw"
            type="number"
            min={0}
            step={1000}
            defaultValue={item.estimated_cost_krw}
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <Checkbox
            id={`cf-${item.id}`}
            checked={childFriendly}
            onCheckedChange={(c) => setChildFriendly(c === true)}
          />
          <Label htmlFor={`cf-${item.id}`} className="cursor-pointer">
            아이 동반 적합
          </Label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
          <X className="h-4 w-4" /> 취소
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          저장
        </Button>
      </div>
    </form>
  );
}
