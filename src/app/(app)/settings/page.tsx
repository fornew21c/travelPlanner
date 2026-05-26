import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { ProfileForm } from "./_components/profile-form";
import { LocaleSwitcher } from "./_components/locale-switcher";

export default async function SettingsPage() {
  const dict = await getDictionary();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, email, locale")
    .eq("id", user!.id)
    .single();

  return (
    <div className="container max-w-2xl space-y-8 py-8 md:py-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{dict.nav.settings}</h1>
        <p className="mt-1 text-muted-foreground">계정 정보와 환경을 관리하세요</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>다른 사용자에게 보이는 정보를 변경합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            email={profile?.email ?? user!.email ?? ""}
            displayName={profile?.display_name ?? ""}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>환경설정</CardTitle>
          <CardDescription>언어와 테마를 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocaleSwitcher currentLocale={(profile?.locale as "ko" | "en") ?? "ko"} />
          <Separator />
          <p className="text-xs text-muted-foreground">
            테마는 우측 상단 다크/라이트 토글로 변경할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
