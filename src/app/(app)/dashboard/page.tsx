import Link from "next/link";
import { Calendar, Plus, Sparkles, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import { formatDateShort, formatDuration, formatKRWCompact } from "@/lib/format";
import type { Trip } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dict = await getDictionary();
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "여행자";

  const { data } = await supabase
    .from("trips")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(8);
  const trips = (data ?? []) as Trip[];

  return (
    <div className="container space-y-8 py-8 md:py-12">
      {/* Greeting */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{dict.dashboard.welcome}</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {displayName}님, 어디로 떠나볼까요?
          </h1>
        </div>
        <Button asChild size="lg">
          <Link href="/planner">
            <Plus className="h-4 w-4" /> {dict.dashboard.newTrip}
          </Link>
        </Button>
      </header>

      {/* Recent trips */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{dict.dashboard.recent}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/trips">전체 보기</Link>
          </Button>
        </div>

        {trips.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="line-clamp-1 text-lg">{trip.title}</CardTitle>
                      <Badge variant={trip.status === "generated" ? "info" : "outline"}>
                        {trip.status === "generated" ? "AI 생성" : "임시저장"}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-1">{trip.destination}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDateShort(trip.start_date)} → {formatDateShort(trip.end_date)} ·{" "}
                      {formatDuration(trip.duration_days)}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" /> 예산 {formatKRWCompact(trip.budget_krw)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState dict={dict} />
        )}
      </section>

      {/* Quick action */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 px-6 py-10 text-primary-foreground md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
              <Sparkles className="h-3.5 w-3.5" /> AI 추천
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              다음 가족 여행을 1분 안에 만들어보세요
            </h2>
            <p className="mt-2 text-primary-foreground/80">
              아이 컨디션, 동선, 예산까지 모두 고려한 맞춤 일정을 받아보세요.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link href="/planner">시작하기</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ dict }: { dict: Awaited<ReturnType<typeof getDictionary>> }) {
  return (
    <Card className="border-dashed bg-background/50">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Sparkles className="h-6 w-6" />
        </span>
        <h3 className="text-lg font-semibold">{dict.dashboard.empty}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{dict.dashboard.emptyDesc}</p>
        <Button asChild className="mt-2">
          <Link href="/planner">{dict.dashboard.newTrip}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
