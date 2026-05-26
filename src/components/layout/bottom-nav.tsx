"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, BookmarkCheck, Settings as SettingsIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface BottomNavProps {
  labels: { dashboard: string; planner: string; saved: string; settings: string };
}

/**
 * Thumb-friendly bottom navigation for mobile.
 * Hidden on desktop where the SiteHeader nav suffices.
 */
export function BottomNav({ labels }: BottomNavProps) {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: labels.dashboard, icon: Home },
    { href: "/planner", label: labels.planner, icon: Plus },
    { href: "/trips", label: labels.saved, icon: BookmarkCheck },
    { href: "/settings", label: labels.settings, icon: SettingsIcon },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
