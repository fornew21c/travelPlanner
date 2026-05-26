import { redirect } from "next/navigation";

import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { getDictionary } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dict = await getDictionary();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <SiteHeader />
      <main className="flex-1 pb-24 md:pb-12">{children}</main>
      <BottomNav
        labels={{
          dashboard: dict.nav.dashboard,
          planner: dict.nav.planner,
          saved: dict.nav.saved,
          settings: dict.nav.settings,
        }}
      />
    </div>
  );
}
