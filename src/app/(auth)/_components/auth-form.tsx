"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
});

type FormValues = z.infer<typeof schema>;

interface AuthFormProps {
  mode: "login" | "signup";
  redirectTo: string;
  dict: Dictionary;
}

export function AuthForm({ mode, redirectTo, dict }: AuthFormProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect_to=${redirectTo}`,
          },
        });
        if (error) throw error;
        toast.success("확인 메일을 보냈어요. 이메일을 확인해주세요.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        // Full-page navigation (not router.replace) so the next request carries
        // the freshly-set auth cookies and the server middleware authenticates
        // on the first try. A client-side nav here races the cookie write and
        // bounced users back to /login, forcing repeated taps to log in.
        window.location.assign(redirectTo);
        return;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{dict.auth.email}</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{dict.auth.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          {...register("password")}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {dict.auth.continueWithEmail}
      </Button>
    </form>
  );
}
