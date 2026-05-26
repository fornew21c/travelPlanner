import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data, error } = await supabase
  .from("trips")
  .delete()
  .eq("status", "draft")
  .select("id, title");

if (error) {
  console.error(error.message);
  process.exit(1);
}
console.log(`Deleted ${data.length} draft trip(s).`);
