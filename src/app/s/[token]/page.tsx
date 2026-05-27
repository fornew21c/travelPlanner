import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Sparkles, Users, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "@/lib/i18n";
import { formatDateFull, formatDuration, formatKRW } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ItineraryDay, ItineraryItem, Trip } from "@/lib/supabase/database.types";

import { DayTimeline } from "@/app/(app)/trips/[id]/_components/day-timeline";

interface PageProps {
  params: Promise<{ token: string }>;
}

// Public payload returned by the get_shared_trip RPC. user_id is stripped server-side.
type SharedTripPayload = {
  trip: Omit<Trip, "user_id">;
  days: ItineraryDay[];
  items: ItineraryItem[];
};

/**
 * Public read-only trip view via share token.
 *
 * Reads go through the `get_shared_trip` SECURITY DEFINER RPC, which returns
 * only the trip matching the exact token. The tables themselves are no longer
 * anon-readable, so a shared link can't be used to enumerate other trips.
 */
export default async function SharedTripPage({ params }: PageProps) {
  const { token } = await params;
  const dict = await getDictionary();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase.rpc("get_shared_trip", { p_token: token });
  const payload = data as SharedTripPayload | null;
  if (!payload) notFound();

  const { trip, days, items } = payload;

  const itemsByDay = new Map<string, typeof items>();
  (items ?? []).forEach((it) => {
    const arr = itemsByDay.get(it.day_id) ?? [];
    arr.push(it);
    itemsByDay.set(it.day_id, arr);
  });

  return (
    <div className="container max-w-4xl space-y-6 py-8 md:py-12">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium">{dict.app.name}</span>
        </Link>
        <Badge variant="info">공유된 일정</Badge>
      </div>

      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> {trip.destination}
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{trip.title}</h1>
        {trip.ai_summary && <p className="max-w-3xl text-muted-foreground">{trip.ai_summary}</p>}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <Card><CardContent className="p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> 기간</p>
          <p className="mt-1 font-semibold">{formatDuration(trip.duration_days)}</p>
          <p className="text-xs text-muted-foreground">{formatDateFull(trip.start_date)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><Users className="h-3.5 w-3.5" /> 인원</p>
          <p className="mt-1 font-semibold">성인 {trip.adults} · 아이 {trip.children}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><Wallet className="h-3.5 w-3.5" /> 예산</p>
          <p className="mt-1 font-semibold">{formatKRW(trip.budget_krw)}</p>
        </CardContent></Card>
      </div>

      <Separator />

      <div className="space-y-6">
        {(days ?? []).map((day) => (
          <DayTimeline
            key={day.id}
            day={day}
            items={(itemsByDay.get(day.id) ?? []).slice().sort((a, b) => a.order_index - b.order_index)}
            dict={dict}
            hotelContext={{
              destination: trip.destination,
              startDate: trip.start_date,
              endDate: trip.end_date,
              adults: trip.adults,
              children: trip.children,
            }}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-dashed bg-background/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">이 일정이 마음에 드시나요?</p>
        <Link
          href="/planner"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          AI로 우리 가족 일정 만들기
        </Link>
      </div>
    </div>
  );
}
