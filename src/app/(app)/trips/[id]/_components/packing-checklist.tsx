"use client";

import * as React from "react";
import { Baby } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { PackingItem } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

import { togglePackingItemAction } from "../actions";

export function PackingChecklist({ items }: { items: PackingItem[] }) {
  // Group by category in memory; SQL ordering already grouped them adjacently.
  const grouped = React.useMemo(() => {
    const map = new Map<string, PackingItem[]>();
    for (const it of items) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return Array.from(map.entries());
  }, [items]);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          체크리스트가 아직 없어요.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {grouped.map(([category, list]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {list.map((item) => (
              <PackingRow key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PackingRow({ item }: { item: PackingItem }) {
  const [checked, setChecked] = React.useState(item.checked);
  const [pending, startTransition] = React.useTransition();

  function onToggle(v: boolean) {
    setChecked(v);
    startTransition(async () => {
      try {
        await togglePackingItemAction(item.id, v);
      } catch {
        setChecked(!v); // revert
      }
    });
  }

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent/50",
        pending && "opacity-60",
      )}
    >
      <span className="flex items-center gap-3">
        <Checkbox checked={checked} onCheckedChange={(v) => onToggle(Boolean(v))} />
        <span className={cn("text-sm", checked && "text-muted-foreground line-through")}>
          {item.name}
          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
        </span>
      </span>
      {item.for_child && (
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <Baby className="h-3 w-3" /> 아이용
        </span>
      )}
    </label>
  );
}
