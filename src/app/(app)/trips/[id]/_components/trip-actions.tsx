"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, MoreHorizontal, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { deleteTripAction, duplicateTripAction, toggleShareAction } from "../actions";

interface TripActionsProps {
  tripId: string;
  hasShare: boolean;
  shareToken: string | null;
}

export function TripActions({ tripId, hasShare, shareToken }: TripActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function handleShare() {
    startTransition(async () => {
      try {
        const result = await toggleShareAction(tripId);
        if (result?.shareToken) {
          const url = `${window.location.origin}/s/${result.shareToken}`;
          await navigator.clipboard.writeText(url);
          toast.success("공유 링크가 복사되었어요");
        } else {
          toast.success("공유가 중단되었어요");
        }
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      try {
        const { id } = await duplicateTripAction(tripId);
        router.push(`/trips/${id}`);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleDelete() {
    if (!confirm("이 여행을 삭제할까요? 되돌릴 수 없습니다.")) return;
    startTransition(async () => {
      try {
        await deleteTripAction(tripId);
        router.push("/trips");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function copyShareLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/s/${shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success("공유 링크가 복사되었어요");
  }

  return (
    <div className="flex items-center gap-2">
      {hasShare && (
        <Button variant="outline" size="sm" onClick={copyShareLink}>
          <Share2 className="h-4 w-4" /> 공유 링크
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="h-4 w-4" /> {hasShare ? "공유 중단" : "공유 링크 만들기"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4" /> 복제
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="h-4 w-4" /> 삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
