// One-shot dev helper: force-confirm any unconfirmed users so you can log in
// without waiting for confirmation email. Uses service_role key — server only.
//
// Usage:
//   node --env-file=.env.local scripts/confirm-all-users.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
if (error) {
  console.error("listUsers failed:", error.message);
  process.exit(1);
}

let confirmed = 0;
for (const user of data.users) {
  if (!user.email_confirmed_at) {
    const { error: updErr } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (updErr) {
      console.warn(`  ⚠ ${user.email}: ${updErr.message}`);
    } else {
      console.log(`  ✓ confirmed: ${user.email}`);
      confirmed++;
    }
  }
}

console.log(`\nDone. Confirmed ${confirmed} user(s). Total: ${data.users.length}`);
