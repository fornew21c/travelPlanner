-- =============================================================================
-- 0002_secure_share.sql
--
-- Fix: the share-link feature leaked every shared trip.
--
-- The original anon SELECT policies used `share_token is not null`, which makes
-- the *secret* irrelevant — any anon client (the public anon key is shipped to
-- the browser) could `select * from trips` and enumerate every shared trip of
-- every user, including budget, notes, child ages and user_id. The per-request
-- `.eq("share_token", token)` filter was only a client-side WHERE, not a
-- security boundary.
--
-- Pure RLS cannot express "you must know the exact token" because the client
-- controls the WHERE clause. So we move public reads behind a SECURITY DEFINER
-- function that takes the token as an argument and returns ONLY the matching
-- trip, and drop anon visibility from the tables entirely.
-- =============================================================================

-- 1. Remove anonymous table-level read access -------------------------------

drop policy if exists "trips_select_by_share_token" on public.trips;

-- days/items: keep owner reads, drop the `or share_token is not null` branch
drop policy if exists "days_select_via_trip" on public.itinerary_days;
create policy "days_select_via_trip" on public.itinerary_days
  for select using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "items_select_via_trip" on public.itinerary_items;
create policy "items_select_via_trip" on public.itinerary_items
  for select using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );

-- 2. Token-gated read function ----------------------------------------------
-- SECURITY DEFINER runs as the function owner (bypasses RLS), but the only way
-- in is an exact-match token. No token, no data. user_id is stripped from the
-- payload so a shared link never reveals the owner's auth id.

create or replace function public.get_shared_trip(p_token text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'trip',  to_jsonb(t) - 'user_id',
    'days',  coalesce(
      (select jsonb_agg(to_jsonb(d) order by d.day_index)
         from public.itinerary_days d where d.trip_id = t.id), '[]'::jsonb),
    'items', coalesce(
      (select jsonb_agg(to_jsonb(i) order by i.order_index)
         from public.itinerary_items i where i.trip_id = t.id), '[]'::jsonb)
  )
  from public.trips t
  where t.share_token = p_token
  limit 1;
$$;

-- Lock down then grant: only the token-taking RPC is reachable anonymously.
revoke all on function public.get_shared_trip(text) from public;
grant execute on function public.get_shared_trip(text) to anon, authenticated;
