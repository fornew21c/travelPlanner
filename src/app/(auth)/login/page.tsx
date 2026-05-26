import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "@/lib/i18n";

import { AuthForm } from "../_components/auth-form";
import { GoogleButton } from "../_components/google-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_to?: string }>;
}) {
  const params = await searchParams;
  const dict = await getDictionary();
  const redirectTo = params.redirect_to ?? "/dashboard";

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{dict.auth.loginTitle}</CardTitle>
        <CardDescription>{dict.auth.loginSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleButton label={dict.auth.continueWithGoogle} redirectTo={redirectTo} />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            {dict.auth.or}
          </span>
        </div>

        <AuthForm mode="login" redirectTo={redirectTo} dict={dict} />

        <p className="pt-2 text-center text-sm text-muted-foreground">
          {dict.auth.noAccount}{" "}
          <Link href="/signup" className="font-medium text-foreground hover:underline">
            {dict.nav.signup}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
