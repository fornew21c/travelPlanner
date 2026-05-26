import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { PlannerForm } from "./_components/planner-form";

export default async function PlannerPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect_to=/planner");

  const dict = await getDictionary();

  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{dict.planner.title}</h1>
        <p className="text-muted-foreground">{dict.planner.subtitle}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>여행 정보 입력</CardTitle>
          <CardDescription>
            기본 정보만 입력하시면 AI가 맞춤 일정을 생성합니다. 모든 항목은 나중에 수정할 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlannerForm dict={dict} />
        </CardContent>
      </Card>
    </div>
  );
}
