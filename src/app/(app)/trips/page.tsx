import Link from "next/link";
import { Calendar, Plus, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import { formatDateShort, formatDuration, formatKRWCompact } from "@/lib/format";
import type { Trip } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { DeleteTripButton } from "@/app/(app)/_components/delete-trip-button";

export const dynamic = "force-dynamic";

export default async function SavedTripsPage() {
  const dict = await getDictionary();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("trips")
    .select("*")
    .order("updated_at", { ascending: false });
  const trips = (data ?? []) as Trip[];

  return (
    <div className="container space-y-6 py-8 md:py-12">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{dict.nav.saved}</h1>
          <p className="mt-1 text-muted-foreground">저장된 가족 여행을 한곳에서 관리하세요</p>
        </div>
        <Button asChild>
          <Link href="/planner">
            <Plus className="h-4 w-4" /> {dict.dashboard.newTrip}
          </Link>
        </Button>
      </header>

      {trips.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-lg">{trip.title}</CardTitle>
                    <div className="flex shrink-0 items-center gap-1">
                      <Badge variant={trip.status === "generated" ? "info" : "outline"}>
                        {trip.status === "generated" ? "AI 생성" : trip.status === "archived" ? "보관" : "임시"}
                      </Badge>
                      <DeleteTripButton tripId={trip.id} title={trip.title} />
                    </div>
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
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-lg font-semibold">{dict.dashboard.empty}</p>
            <p className="text-sm text-muted-foreground">{dict.dashboard.emptyDesc}</p>
            <Button asChild className="mt-2">
              <Link href="/planner">{dict.dashboard.newTrip}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
