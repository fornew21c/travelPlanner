"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateItinerary, generatePackingList } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { diffDaysInclusive, parseChildAges, tripFormSchema } from "@/lib/validations/trip";

export type GenerateTripState = {
  error?: string;
  tripId?: string;
};

// Server-side throttle for the (paid) AI generation. The client already
// disables the button while pending, but that won't stop a determined user
// hammering it across tabs or calling the action directly — so we gate the AI
// call on how many trips the user has created recently.
const RATE_WINDOW_SECONDS = 60; // burst window
const RATE_MAX_IN_WINDOW = 3; // max generations per burst window
const DAILY_MAX = 20; // max generations per rolling 24h

async function checkRateLimit(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
): Promise<string | null> {
  const now = Date.now();
  const burstSince = new Date(now - RATE_WINDOW_SECONDS * 1000).toISOString();
  const daySince = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const [{ count: burstCount }, { count: dayCount }] = await Promise.all([
    supabase
      .from("trips")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", burstSince),
    supabase
      .from("trips")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", daySince),
  ]);

  if ((burstCount ?? 0) >= RATE_MAX_IN_WINDOW) {
    return "요청이 너무 잦아요. 잠시 후 다시 시도해주세요.";
  }
  if ((dayCount ?? 0) >= DAILY_MAX) {
    return "오늘 생성 한도를 모두 사용했어요. 내일 다시 시도해주세요.";
  }
  return null;
}

/**
 * Server action invoked by the planner form.
 * 1. Validates input.
 * 2. Creates a draft trip row owned by the user.
 * 3. Calls the AI provider to generate itinerary + packing list.
 * 4. Persists days, items, and packing items in a single transaction-like flow.
 * 5. Redirects to the result page.
 *
 * On any failure after the draft is created, the empty draft is deleted
 * (failAndCleanup) so a failed generation doesn't leave an orphan "임시" card.
 * The AI step itself retries once internally before surfacing an error.
 */
export async function generateTripAction(
  _prev: GenerateTripState,
  formData: FormData,
): Promise<GenerateTripState> {
  const raw = Object.fromEntries(formData);
  const parsed = tripFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "입력값이 올바르지 않습니다" };
  }
  const input = parsed.data;
  const childAges = parseChildAges(input.childAges);
  const duration = diffDaysInclusive(input.startDate, input.endDate);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다" };

  // 0) Rate-limit before doing any paid work (draft insert + AI calls)
  const limitError = await checkRateLimit(supabase, user.id);
  if (limitError) return { error: limitError };

  // 1) Insert draft trip
  const title = `${input.destination} ${duration - 1}박 ${duration}일`;
  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title,
      destination: input.destination,
      start_date: input.startDate,
      end_date: input.endDate,
      budget_krw: input.budget,
      adults: input.adults,
      children: input.children,
      child_ages: childAges,
      travel_style: input.travelStyle,
      transport: input.transport,
      pace: input.pace,
      notes: input.notes || null,
      status: "draft",
    })
    .select("id")
    .single();
  if (tripErr || !trip) return { error: tripErr?.message ?? "여행을 저장하지 못했습니다" };

  // Any failure after this point should remove the empty draft so a failed
  // generation doesn't leave a confusing "임시" card on the dashboard. The FK
  // cascade clears any partially-inserted days/items.
  const failAndCleanup = async (message: string): Promise<GenerateTripState> => {
    await supabase.from("trips").delete().eq("id", trip.id);
    return { error: message };
  };

  // 2) Generate itinerary + packing in parallel
  let itinerary, packing;
  try {
    [itinerary, packing] = await Promise.all([
      generateItinerary({
        destination: input.destination,
        startDate: input.startDate,
        endDate: input.endDate,
        durationDays: duration,
        budgetKrw: input.budget,
        adults: input.adults,
        children: input.children,
        childAges,
        travelStyle: input.travelStyle,
        transport: input.transport,
        pace: input.pace,
        notes: input.notes,
      }),
      generatePackingList({
        destination: input.destination,
        startDate: input.startDate,
        endDate: input.endDate,
        durationDays: duration,
        adults: input.adults,
        children: input.children,
        childAges,
        travelStyle: input.travelStyle,
      }),
    ]);
  } catch (err) {
    console.error("[planner] AI generation failed:", err);
    return failAndCleanup(`AI 생성에 실패했어요: ${(err as Error).message}`);
  }

  // 3) Insert itinerary days
  const startDate = new Date(input.startDate);
  const daysToInsert = itinerary.data.days.map((day) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + (day.day_index - 1));
    return {
      trip_id: trip.id,
      day_index: day.day_index,
      date: d.toISOString().slice(0, 10),
      title: day.title,
      summary: day.summary,
    };
  });
  const { data: insertedDays, error: daysErr } = await supabase
    .from("itinerary_days")
    .insert(daysToInsert)
    .select("id, day_index");
  if (daysErr || !insertedDays) return failAndCleanup(daysErr?.message ?? "일정 저장 실패");

  const dayIdByIndex = new Map(insertedDays.map((d) => [d.day_index, d.id]));

  // 4) Insert itinerary items
  const itemsToInsert = itinerary.data.days.flatMap((day) =>
    day.items.map((item, idx) => ({
      day_id: dayIdByIndex.get(day.day_index)!,
      trip_id: trip.id,
      order_index: idx,
      type: item.type,
      title: item.title,
      description: item.description,
      location_name: item.location_name || null,
      address: item.address || null,
      start_time: item.start_time ?? null,
      end_time: item.end_time ?? null,
      estimated_cost_krw: item.estimated_cost_krw ?? 0,
      child_friendly: item.child_friendly,
      tips: item.tips || null,
    })),
  );
  if (itemsToInsert.length > 0) {
    const { error: itemsErr } = await supabase.from("itinerary_items").insert(itemsToInsert);
    if (itemsErr) return failAndCleanup(itemsErr.message);
  }

  // 5) Insert packing list + items
  const { data: list, error: listErr } = await supabase
    .from("packing_lists")
    .insert({ trip_id: trip.id, user_id: user.id })
    .select("id")
    .single();
  if (listErr || !list) return failAndCleanup(listErr?.message ?? "체크리스트 저장 실패");

  const packingItems = packing.data.items.map((p, idx) => ({
    list_id: list.id,
    user_id: user.id,
    category: p.category,
    name: p.name,
    quantity: p.quantity,
    for_child: p.for_child,
    notes: p.notes || null,
    order_index: idx,
  }));
  if (packingItems.length > 0) {
    const { error: pErr } = await supabase.from("packing_items").insert(packingItems);
    if (pErr) return failAndCleanup(pErr.message);
  }

  // 6) Mark trip as generated + persist AI metadata
  await supabase
    .from("trips")
    .update({
      status: "generated",
      ai_provider: itinerary.provider,
      ai_model: itinerary.model,
      ai_summary: itinerary.data.summary,
    })
    .eq("id", trip.id);

  revalidatePath("/dashboard");
  revalidatePath("/trips");
  redirect(`/trips/${trip.id}`);
}
