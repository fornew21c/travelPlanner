import { notFound } from "next/navigation";
import { BedDouble, Calendar, MapPin, Ticket, Users, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildActivitySearchUrl, buildHotelSearchUrl } from "@/lib/affiliate";
import { getDictionary } from "@/lib/i18n";
import { formatDateFull, formatDuration, formatKRW } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { DayTimeline } from "./_components/day-timeline";
import { PackingChecklist } from "./_components/packing-checklist";
import { TripActions } from "./_components/trip-actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params;
  const dict = await getDictionary();
  const supabase = await createSupabaseServerClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();
  if (!trip) notFound();

  const [{ data: days }, { data: items }, { data: list }] = await Promise.all([
    supabase
      .from("itinerary_days")
      .select("*")
      .eq("trip_id", id)
      .order("day_index", { ascending: true }),
    supabase
      .from("itinerary_items")
      .select("*")
      .eq("trip_id", id)
      .order("order_index", { ascending: true }),
    supabase
      .from("packing_lists")
      .select("id, packing_items(*)")
      .eq("trip_id", id)
      .maybeSingle(),
  ]);

  const packingItems = (list?.packing_items ?? []).slice().sort((a, b) => {
    return a.category.localeCompare(b.category) || a.order_index - b.order_index;
  });

  const itemsByDay = new Map<string, typeof items>();
  (items ?? []).forEach((it) => {
    const arr = itemsByDay.get(it.day_id) ?? [];
    arr.push(it);
    itemsByDay.set(it.day_id, arr);
  });

  const totalEstimated = (items ?? []).reduce((acc, i) => acc + (i.estimated_cost_krw ?? 0), 0);

  return (
    <div className="container space-y-6 py-6 md:py-10">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {trip.destination}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{trip.title}</h1>
            {trip.ai_summary && (
              <p className="max-w-3xl text-muted-foreground">{trip.ai_summary}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href={buildHotelSearchUrl({
                  query: trip.destination,
                  checkIn: trip.start_date,
                  checkOut: trip.end_date,
                  adults: trip.adults,
                  children: trip.children,
                })}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
              >
                <BedDouble className="h-4 w-4" /> 호텔 검색
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={buildActivitySearchUrl({ query: trip.destination })}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
              >
                <Ticket className="h-4 w-4" /> 투어·입장권
              </a>
            </Button>
            <TripActions tripId={trip.id} hasShare={Boolean(trip.share_token)} shareToken={trip.share_token} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Stat icon={Calendar} label="여행 기간" value={formatDuration(trip.duration_days)} sub={`${formatDateFull(trip.start_date)} →`} />
          <Stat icon={Users} label="가족 구성" value={`성인 ${trip.adults}, 아이 ${trip.children}`} sub={trip.child_ages.length ? `${trip.child_ages.map((a) => `${a}세`).join(", ")}` : "—"} />
          <Stat icon={Wallet} label="예산" value={formatKRW(trip.budget_krw)} sub={`예상 ${formatKRW(totalEstimated)}`} />
          <Stat icon={MapPin} label="스타일" value={dict.travelStyle[trip.travel_style]} sub={`${dict.transport[trip.transport]} · ${dict.pace[trip.pace]}`} />
        </div>
      </header>

      <Separator />

      <Tabs defaultValue="itinerary">
        <TabsList>
          <TabsTrigger value="itinerary">{dict.result.dayByDay}</TabsTrigger>
          <TabsTrigger value="packing">{dict.result.packing}</TabsTrigger>
          <TabsTrigger value="budget">{dict.result.budget}</TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary" className="space-y-6">
          {(days ?? []).map((day) => (
            <DayTimeline
              key={day.id}
              day={day}
              items={(itemsByDay.get(day.id) ?? []).slice().sort((a, b) => a.order_index - b.order_index)}
              dict={dict}
              editable
              tripId={trip.id}
              hotelContext={{
                destination: trip.destination,
                startDate: trip.start_date,
                endDate: trip.end_date,
                adults: trip.adults,
                children: trip.children,
              }}
              tripChildren={trip.children}
            />
          ))}
        </TabsContent>

        <TabsContent value="packing">
          <PackingChecklist items={packingItems} />
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>{dict.result.estimatedTotal}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">예상 합계 (숙박 제외)</span>
                <span className="text-2xl font-bold tracking-tight">{formatKRW(totalEstimated)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">설정한 예산</span>
                <span className="font-medium">{formatKRW(trip.budget_krw)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">남는 예산 (숙박비 차감 전)</span>
                <Badge variant={totalEstimated <= trip.budget_krw ? "success" : "warning"}>
                  {formatKRW(trip.budget_krw - totalEstimated)}
                </Badge>
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                숙박비는 시즌·등급에 따라 변동이 매우 커서 합계에서 제외됩니다. 실제 호텔 가격은 부킹닷컴, 아고다 등에서 확인 후 더해주세요.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        <p className="text-lg font-semibold tracking-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
