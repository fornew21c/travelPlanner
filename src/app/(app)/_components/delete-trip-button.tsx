"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { deleteTripAction } from "@/app/(app)/trips/[id]/actions";

/**
 * Delete affordance for a trip card in a list view. The card is wrapped in a
 * <Link>, so we stop propagation/default to delete in place instead of
 * navigating into the trip.
 */
export function DeleteTripButton({ tripId, title }: { tripId: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`'${title}' 여행을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    startTransition(async () => {
      try {
        await deleteTripAction(tripId);
        toast.success("여행을 삭제했어요");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`${title} 삭제`}
      onClick={handleClick}
      disabled={pending}
      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
