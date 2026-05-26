-- =============================================================================
-- Secure share-token reads
--
-- The original `trips_select_by_share_token` policy used
--   using (share_token is not null)
-- which let ANY caller (including anon, whose key is public) read EVERY trip
-- that had a share token set — not just the one matching a given token.
-- The same leak applied to itinerary_days / itinerary_items via their
-- `... or t.share_token is not null` select policies.
--
-- RLS cannot validate the token carried in a query, so public share reads are
-- moved to a SECURITY DEFINER RPC that matches an exact token, and the broad
-- anon select policies are removed.
-- =============================================================================

-- 1) Drop the permissive anon read on trips.
drop policy if exists "trips_select_by_share_token" on public.trips;

-- 2) Tighten days/items select to owner-only. Share reads no longer go through
--    these table policies (they use get_shared_trip instead).
drop policy if exists "days_select_via_trip" on public.itinerary_days;
create policy "days_select_via_trip" on public.itinerary_days
  for select using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

drop policy if exists "items_select_via_trip" on public.itinerary_items;
create policy "items_select_via_trip" on public.itinerary_items
  for select using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- 3) Public share read via exact token match. SECURITY DEFINER bypasses RLS
--    but only ever returns the single trip whose share_token equals p_token.
create or replace function public.get_shared_trip(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'trip', to_jsonb(t),
    'days', coalesce(
      (select jsonb_agg(to_jsonb(d) order by d.day_index)
         from public.itinerary_days d
        where d.trip_id = t.id),
      '[]'::jsonb
    ),
    'items', coalesce(
      (select jsonb_agg(to_jsonb(i) order by i.order_index)
         from public.itinerary_items i
        where i.trip_id = t.id),
      '[]'::jsonb
    )
  )
  from public.trips t
  where t.share_token = p_token
    and p_token is not null
    and length(p_token) > 0
  limit 1;
$$;

revoke execute on function public.get_shared_trip(text) from public;
grant execute on function public.get_shared_trip(text) to anon, authenticated;
