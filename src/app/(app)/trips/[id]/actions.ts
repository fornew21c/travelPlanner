"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateShareToken } from "@/lib/utils";

async function ensureOwner(tripId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다");
  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, user_id, share_token")
    .eq("id", tripId)
    .single();
  if (error || !trip || trip.user_id !== user.id) throw new Error("권한이 없습니다");
  return { supabase, trip, user };
}

export async function deleteTripAction(tripId: string) {
  const { supabase } = await ensureOwner(tripId);
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/trips");
  // Navigation is done client-side. Calling redirect() here would throw
  // NEXT_REDIRECT, which the caller's try/catch surfaces as a fake error toast.
}

export async function duplicateTripAction(tripId: string) {
  const { supabase, trip, user } = await ensureOwner(tripId);

  const { data: original } = await supabase
    .from("trips")
    .select("*")
    .eq("id", trip.id)
    .single();
  if (!original) throw new Error("원본을 찾을 수 없습니다");

  const { data: copy, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title: `${original.title} (복제)`,
      destination: original.destination,
      destination_country: original.destination_country,
      start_date: original.start_date,
      end_date: original.end_date,
      budget_krw: original.budget_krw,
      adults: original.adults,
      children: original.children,
      child_ages: original.child_ages,
      travel_style: original.travel_style,
      transport: original.transport,
      pace: original.pace,
      notes: original.notes,
      status: original.status,
      ai_provider: original.ai_provider,
      ai_model: original.ai_model,
      ai_summary: original.ai_summary,
    })
    .select("id")
    .single();
  if (error || !copy) throw new Error(error?.message ?? "복제 실패");

  // Copy days
  const { data: days } = await supabase
    .from("itinerary_days")
    .select("id, day_index, date, title, summary")
    .eq("trip_id", trip.id);
  if (days?.length) {
    const dayRows = days.map((d) => ({
      trip_id: copy.id,
      day_index: d.day_index,
      date: d.date,
      title: d.title,
      summary: d.summary,
    }));
    const { data: newDays } = await supabase
      .from("itinerary_days")
      .insert(dayRows)
      .select("id, day_index");
    const newDayMap = new Map(newDays?.map((nd) => [nd.day_index, nd.id]));

    // Copy items
    const { data: items } = await supabase
      .from("itinerary_items")
      .select("day_id, order_index, type, title, description, location_name, address, start_time, end_time, estimated_cost_krw, child_friendly, tips, url")
      .eq("trip_id", trip.id);

    const oldDayToIdx = new Map(days.map((d) => [d.id, d.day_index]));
    if (items?.length) {
      const itemRows = items.map((it) => ({
        ...it,
        trip_id: copy.id,
        day_id: newDayMap.get(oldDayToIdx.get(it.day_id)!)!,
      }));
      await supabase.from("itinerary_items").insert(itemRows);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/trips");
  // Return the new id so the client can navigate (see deleteTripAction note).
  return { id: copy.id };
}

export async function toggleShareAction(tripId: string) {
  const { supabase, trip } = await ensureOwner(tripId);
  const nextToken = trip.share_token ? null : generateShareToken();
  const { error } = await supabase
    .from("trips")
    .update({ share_token: nextToken })
    .eq("id", trip.id);
  if (error) throw new Error(error.message);
  revalidatePath(`/trips/${tripId}`);
  return { shareToken: nextToken };
}

// Inline-edit of a single itinerary item. Empty time/text fields normalize to
// null so we don't persist "" into nullable columns. Owner is verified via the
// trip; RLS (`items_cud_via_trip`) is the second line of defense.
const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const itemUpdateSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요").max(200),
  type: z.enum([
    "attraction",
    "restaurant",
    "transport",
    "accommodation",
    "activity",
    "rest",
    "note",
  ]),
  start_time: z.preprocess(emptyToNull, z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable()),
  end_time: z.preprocess(emptyToNull, z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable()),
  location_name: z.preprocess(emptyToNull, z.string().max(200).nullable()),
  description: z.preprocess(emptyToNull, z.string().max(2000).nullable()),
  tips: z.preprocess(emptyToNull, z.string().max(1000).nullable()),
  estimated_cost_krw: z.coerce.number().int().min(0).max(1_000_000_000),
  child_friendly: z.boolean(),
});

export type ItemUpdateInput = z.input<typeof itemUpdateSchema>;

export async function updateItineraryItemAction(
  itemId: string,
  tripId: string,
  input: ItemUpdateInput,
) {
  const { supabase } = await ensureOwner(tripId);
  const values = itemUpdateSchema.parse(input);
  const { error } = await supabase
    .from("itinerary_items")
    .update(values)
    .eq("id", itemId)
    .eq("trip_id", tripId);
  if (error) throw new Error(error.message);
  revalidatePath(`/trips/${tripId}`);
}

export async function togglePackingItemAction(itemId: string, checked: boolean) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("packing_items")
    .update({ checked })
    .eq("id", itemId);
  if (error) throw new Error(error.message);
}
