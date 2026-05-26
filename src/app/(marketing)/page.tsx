import Link from "next/link";
import { ArrowRight, Baby, Compass, MapPin, Sparkles, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";

import { FaqSection } from "./_components/faq-section";
import { TestimonialsSection } from "./_components/testimonials-section";
import { ExampleItinerarySection } from "./_components/example-itinerary-section";

export default async function LandingPage() {
  const dict = await getDictionary();

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="container relative flex flex-col items-center gap-8 py-24 text-center md:py-32">
          <Badge variant="info" className="rounded-full px-3 py-1 text-xs">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            AI 기반 가족 맞춤 여행 플래너
          </Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            {dict.landing.heroTitleA}
            <br />
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-indigo-400">
              {dict.landing.heroTitleB}
            </span>
          </h1>
          <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            {dict.landing.heroSubtitle}
          </p>
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/planner">
                {dict.landing.ctaPrimary}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="w-full sm:w-auto">
              <Link href="#examples">{dict.landing.ctaSecondary}</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">신용카드 필요 없음 · 30초 안에 시작</p>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {dict.landing.featuresTitle}
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Baby, title: dict.landing.feature1Title, desc: dict.landing.feature1Desc },
            { icon: Wallet, title: dict.landing.feature2Title, desc: dict.landing.feature2Desc },
            { icon: MapPin, title: dict.landing.feature3Title, desc: dict.landing.feature3Desc },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-border/60">
              <CardHeader>
                <span className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Example itineraries */}
      <section id="examples" className="bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {dict.landing.examplesTitle}
            </h2>
          </div>
          <div className="mt-12">
            <ExampleItinerarySection />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {dict.landing.testimonialsTitle}
          </h2>
        </div>
        <div className="mt-12">
          <TestimonialsSection />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {dict.landing.faqTitle}
            </h2>
          </div>
          <div className="mt-12">
            <FaqSection />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-20 md:py-28">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 px-6 py-16 text-center text-primary-foreground md:px-12 md:py-20">
          <Compass className="mx-auto h-10 w-10 opacity-90" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {dict.landing.finalCtaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            {dict.landing.finalCtaDesc}
          </p>
          <Button asChild size="xl" variant="secondary" className="mt-8">
            <Link href="/planner">
              {dict.landing.ctaPrimary}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
