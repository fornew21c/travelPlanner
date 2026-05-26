-- =============================================================================
-- AI Family Travel Planner – Initial Schema
-- Postgres / Supabase
--
-- Conventions:
--   - All user-owned rows have user_id REFERENCES auth.users(id) ON DELETE CASCADE
--   - Every table has RLS enabled with strict user_id = auth.uid() policies
--   - Timestamps use timestamptz with timezone-aware defaults
--   - Soft-typed enums implemented as Postgres enums for query performance
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type travel_style as enum (
  'relaxed',      -- 휴양 위주
  'sightseeing',  -- 관광 위주
  'adventure',    -- 액티비티
  'cultural',     -- 문화/역사
  'foodie',       -- 미식
  'shopping',     -- 쇼핑
  'balanced'      -- 균형
);

create type transport_pref as enum (
  'public',       -- 대중교통
  'rental_car',   -- 렌터카
  'taxi',         -- 택시
  'walking',      -- 도보 위주
  'mixed'         -- 혼합
);

create type travel_pace as enum (
  'slow',         -- 여유롭게
  'moderate',     -- 보통
  'packed'        -- 알찬 일정
);

create type trip_status as enum (
  'draft',
  'generated',
  'archived'
);

create type itinerary_item_type as enum (
  'attraction',
  'restaurant',
  'transport',
  'accommodation',
  'activity',
  'rest',
  'note'
);

-- -----------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  avatar_url   text,
  locale       text not null default 'ko',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create profile row when a new auth user is inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- trips
-- -----------------------------------------------------------------------------
create table public.trips (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  title               text not null,
  destination         text not null,           -- e.g. "일본 도쿄"
  destination_country text,
  start_date          date not null,
  end_date            date not null,
  duration_days       integer generated always as ((end_date - start_date) + 1) stored,
  budget_krw          bigint not null default 0,
  adults              integer not null default 2,
  children            integer not null default 0,
  child_ages          integer[] not null default '{}',
  travel_style        travel_style not null default 'balanced',
  transport           transport_pref not null default 'mixed',
  pace                travel_pace not null default 'moderate',
  notes               text,
  status              trip_status not null default 'draft',
  cover_image_url     text,
  share_token         text unique,             -- public-read share link token
  ai_provider         text,                    -- 'anthropic' | 'openai' (audit)
  ai_model            text,
  ai_summary          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint trips_dates_valid check (end_date >= start_date),
  constraint trips_budget_nonneg check (budget_krw >= 0),
  constraint trips_pax_positive check (adults >= 1 and children >= 0)
);

create index trips_user_id_idx       on public.trips (user_id, updated_at desc);
create index trips_status_idx        on public.trips (user_id, status);
create index trips_share_token_idx   on public.trips (share_token) where share_token is not null;

-- -----------------------------------------------------------------------------
-- itinerary_days  (one row per day of a trip)
-- -----------------------------------------------------------------------------
create table public.itinerary_days (
  id          uuid primary key default uuid_generate_v4(),
  trip_id     uuid not null references public.trips(id) on delete cascade,
  day_index   integer not null,                -- 1-based
  date        date not null,
  title       text,                            -- e.g. "도쿄 시부야 탐험"
  summary     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (trip_id, day_index)
);

create index itinerary_days_trip_idx on public.itinerary_days (trip_id, day_index);

-- -----------------------------------------------------------------------------
-- itinerary_items  (timeline entries within a day)
-- -----------------------------------------------------------------------------
create table public.itinerary_items (
  id              uuid primary key default uuid_generate_v4(),
  day_id          uuid not null references public.itinerary_days(id) on delete cascade,
  trip_id         uuid not null references public.trips(id) on delete cascade,
  order_index     integer not null,
  type            itinerary_item_type not null,
  title           text not null,
  description     text,
  location_name   text,
  address         text,
  latitude        numeric(9,6),
  longitude       numeric(9,6),
  start_time      time,
  end_time        time,
  estimated_cost_krw bigint default 0,
  child_friendly  boolean not null default true,
  tips            text,                        -- AI tip e.g. "유모차 진입 가능"
  url             text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index itinerary_items_day_idx  on public.itinerary_items (day_id, order_index);
create index itinerary_items_trip_idx on public.itinerary_items (trip_id);

-- -----------------------------------------------------------------------------
-- packing_lists  +  packing_items
-- -----------------------------------------------------------------------------
create table public.packing_lists (
  id          uuid primary key default uuid_generate_v4(),
  trip_id     uuid not null references public.trips(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index packing_lists_trip_uidx on public.packing_lists (trip_id);

create table public.packing_items (
  id           uuid primary key default uuid_generate_v4(),
  list_id      uuid not null references public.packing_lists(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  category     text not null,                  -- '의류' | '서류' | '아이용품' | ...
  name         text not null,
  quantity     integer not null default 1,
  checked      boolean not null default false,
  for_child    boolean not null default false,
  notes        text,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);

create index packing_items_list_idx on public.packing_items (list_id, category, order_index);

-- -----------------------------------------------------------------------------
-- favorites  (POI a user wants to remember across trips)
-- -----------------------------------------------------------------------------
create table public.favorites (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  trip_id       uuid references public.trips(id) on delete set null,
  item_id       uuid references public.itinerary_items(id) on delete set null,
  name          text not null,
  location_name text,
  address       text,
  notes         text,
  created_at    timestamptz not null default now(),
  unique (user_id, name, location_name)
);

create index favorites_user_idx on public.favorites (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated         before update on public.profiles         for each row execute function public.touch_updated_at();
create trigger trg_trips_updated            before update on public.trips            for each row execute function public.touch_updated_at();
create trigger trg_itinerary_days_updated   before update on public.itinerary_days   for each row execute function public.touch_updated_at();
create trigger trg_itinerary_items_updated  before update on public.itinerary_items  for each row execute function public.touch_updated_at();
create trigger trg_packing_lists_updated    before update on public.packing_lists    for each row execute function public.touch_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles         enable row level security;
alter table public.trips            enable row level security;
alter table public.itinerary_days   enable row level security;
alter table public.itinerary_items  enable row level security;
alter table public.packing_lists    enable row level security;
alter table public.packing_items    enable row level security;
alter table public.favorites        enable row level security;

-- profiles ------------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- trips ---------------------------------------------------------------------
create policy "trips_select_own" on public.trips
  for select using (auth.uid() = user_id);
-- Allow anonymous read by share_token (public link sharing)
create policy "trips_select_by_share_token" on public.trips
  for select using (share_token is not null);

create policy "trips_insert_own" on public.trips
  for insert with check (auth.uid() = user_id);
create policy "trips_update_own" on public.trips
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "trips_delete_own" on public.trips
  for delete using (auth.uid() = user_id);

-- itinerary_days ------------------------------------------------------------
create policy "days_select_via_trip" on public.itinerary_days
  for select using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id
        and (t.user_id = auth.uid() or t.share_token is not null)
    )
  );
create policy "days_cud_via_trip" on public.itinerary_days
  for all using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- itinerary_items -----------------------------------------------------------
create policy "items_select_via_trip" on public.itinerary_items
  for select using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id
        and (t.user_id = auth.uid() or t.share_token is not null)
    )
  );
create policy "items_cud_via_trip" on public.itinerary_items
  for all using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- packing_lists -------------------------------------------------------------
create policy "packing_lists_own" on public.packing_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- packing_items -------------------------------------------------------------
create policy "packing_items_own" on public.packing_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- favorites -----------------------------------------------------------------
create policy "favorites_own" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
