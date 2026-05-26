"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateProfileAction } from "../actions";

interface ProfileFormProps {
  email: string;
  displayName: string;
}

export function ProfileForm({ email, displayName }: ProfileFormProps) {
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    const res = await updateProfileAction(formData);
    setSubmitting(false);
    if (res?.error) toast.error(res.error);
    else toast.success("저장되었어요");
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">이름</Label>
        <Input id="displayName" name="displayName" defaultValue={displayName} required />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        저장
      </Button>
    </form>
  );
}
