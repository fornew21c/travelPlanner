"use client";

import * as React from "react";
import { useActionState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Dictionary } from "@/lib/i18n";

import { generateTripAction, type GenerateTripState } from "../actions";

const initialState: GenerateTripState = {};

const TRAVEL_STYLES = ["balanced", "relaxed", "sightseeing", "adventure", "cultural", "foodie", "shopping"] as const;
const TRANSPORTS = ["mixed", "public", "rental_car", "taxi", "walking"] as const;
const PACES = ["moderate", "slow", "packed"] as const;

export function PlannerForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, isPending] = useActionState(generateTripAction, initialState);
  const [children, setChildren] = React.useState(0);
  const todayISO = new Date().toISOString().slice(0, 10);

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="space-y-6">
      <Field id="destination" label={dict.planner.destination}>
        <Input
          name="destination"
          required
          placeholder={dict.planner.destinationPlaceholder}
          autoComplete="off"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="startDate" label={dict.planner.startDate}>
          <Input name="startDate" type="date" required min={todayISO} />
        </Field>
        <Field id="endDate" label={dict.planner.endDate}>
          <Input name="endDate" type="date" required min={todayISO} />
        </Field>
      </div>

      <Field id="budget" label={dict.planner.budget}>
        <Input
          name="budget"
          type="number"
          inputMode="numeric"
          min={0}
          step={10000}
          required
          placeholder="3000000"
        />
        <p className="text-xs text-muted-foreground">총 예산을 원화로 입력해주세요</p>
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="adults" label={dict.planner.adults}>
          <Input name="adults" type="number" min={1} max={10} defaultValue={2} required />
        </Field>
        <Field id="children" label={dict.planner.children}>
          <Input
            name="children"
            type="number"
            min={0}
            max={10}
            defaultValue={0}
            required
            onChange={(e) => setChildren(Number(e.target.value))}
          />
        </Field>
      </div>

      {children > 0 && (
        <Field id="childAges" label={dict.planner.childAges}>
          <Input name="childAges" placeholder={dict.planner.childAgesPlaceholder} />
          <p className="text-xs text-muted-foreground">아이 나이를 콤마로 구분해주세요 (예: 5, 7)</p>
        </Field>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Field id="travelStyle" label={dict.planner.style}>
          <Select name="travelStyle" defaultValue="balanced">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TRAVEL_STYLES.map((s) => (
                <SelectItem key={s} value={s}>
                  {dict.travelStyle[s as keyof typeof dict.travelStyle]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field id="transport" label={dict.planner.transport}>
          <Select name="transport" defaultValue="mixed">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TRANSPORTS.map((t) => (
                <SelectItem key={t} value={t}>
                  {dict.transport[t as keyof typeof dict.transport]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field id="pace" label={dict.planner.pace}>
          <Select name="pace" defaultValue="moderate">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PACES.map((p) => (
                <SelectItem key={p} value={p}>
                  {dict.pace[p as keyof typeof dict.pace]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field id="notes" label={dict.planner.notes}>
        <Textarea name="notes" placeholder={dict.planner.notesPlaceholder} rows={4} />
      </Field>

      <Button type="submit" size="xl" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        {isPending ? dict.planner.generating : dict.planner.submit}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

