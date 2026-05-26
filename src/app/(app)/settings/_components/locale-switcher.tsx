"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";

import { setLocaleAction } from "../actions";

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [pending, startTransition] = React.useTransition();

  return (
    <div className="space-y-2">
      <Label>언어</Label>
      <Select
        defaultValue={currentLocale}
        onValueChange={(value) => {
          startTransition(async () => {
            await setLocaleAction(value as Locale);
          });
        }}
      >
        <SelectTrigger className="max-w-xs" disabled={pending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ko">한국어</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        UI 텍스트가 선택한 언어로 표시됩니다. AI는 한국어 응답에 최적화되어 있어요.
      </p>
    </div>
  );
}
