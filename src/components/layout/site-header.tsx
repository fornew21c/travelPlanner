import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDictionary } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const dict = await getDictionary();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="hidden text-base font-semibold tracking-tight sm:inline">
            {dict.app.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">{dict.nav.dashboard}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/planner">{dict.nav.planner}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/trips">{dict.nav.saved}</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu
              email={user.email ?? ""}
              avatarUrl={user.user_metadata?.avatar_url}
              displayName={user.user_metadata?.full_name ?? user.user_metadata?.name}
              logoutLabel={dict.nav.logout}
              settingsLabel={dict.nav.settings}
            />
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">{dict.nav.login}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{dict.nav.signup}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
