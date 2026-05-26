import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data: trips, error } = await supabase
  .from("trips")
  .select("id, title, destination, status, ai_provider, created_at")
  .order("created_at", { ascending: false });

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Total trips: ${trips.length}\n`);
for (const t of trips) {
  console.log(`  [${t.status.padEnd(9)}] ${t.title}`);
  console.log(`    id: ${t.id}`);
  console.log(`    ai: ${t.ai_provider ?? "—"}    created: ${t.created_at}\n`);
}
