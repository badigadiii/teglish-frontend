"use client";

import { BookMarkedIcon, HeadphonesIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const featureCards = [
  {
    title: "Learner flow",
    description:
      "Public single-exercise practice, profile-driven auth state, and quiz routes prepared for later stages.",
    icon: BookMarkedIcon,
  },
  {
    title: "Media dictation",
    description:
      "Dedicated UX for audio-driven dictation exercises with media URL normalization.",
    icon: HeadphonesIcon,
  },
  {
    title: "Staff context",
    description:
      "Role-gated staff shell already separates moderation workflows from learner-facing screens.",
    icon: ShieldCheckIcon,
  },
];

export default function HomePage() {
  const router = useRouter();
  const { hasToken, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && hasToken) {
      router.replace("/profile");
    }
  }, [hasToken, isLoading, router]);

  return (
    <div className="space-y-10 py-6 md:py-10">
      <section className="rounded-xl border bg-card p-8 shadow-sm md:p-10">
        <PageHeader
          eyebrow="Frontend Implementation"
          title="Structured learning UI on top of the current FastAPI contract"
          description="Stages 0-5 now cover the shell, auth, profile, API state, and public single-exercise practice. Later stages expand authoring, quizzes, and staff operations."
          actions={
            <>
              <Button asChild>
                <Link href="/register">Start with an account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </>
          }
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Badge>shadcn/ui</Badge>
          <Badge variant="secondary">TanStack Query</Badge>
          <Badge variant="secondary">React Hook Form + Zod</Badge>
          <Badge variant="outline">FastAPI backend contract</Badge>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {featureCards.map((card) => (
          <Card className="shadow-sm" key={card.title}>
            <CardHeader className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <card.icon className="size-5" />
              </div>
              <div className="space-y-2">
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Available routes right now</CardTitle>
            <CardDescription>
              Learners can already authenticate and open a public exercise
              directly by ID.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button
              asChild
              className="justify-start rounded-2xl px-5 py-6"
              variant="outline"
            >
              <Link href="/exercises/1">
                Open public exercise `/exercises/1`
              </Link>
            </Button>
            <Button
              asChild
              className="justify-start rounded-2xl px-5 py-6"
              variant="outline"
            >
              <Link href="/profile">Go to protected profile</Link>
            </Button>
            <Button
              asChild
              className="justify-start rounded-2xl px-5 py-6"
              variant="outline"
            >
              <Link href="/exercises/new">Authoring shell</Link>
            </Button>
            <Button
              asChild
              className="justify-start rounded-2xl px-5 py-6"
              variant="outline"
            >
              <Link href="/staff">Staff shell</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>MVP notes</CardTitle>
            <CardDescription>
              JWT is stored in `localStorage` for this version because the
              backend does not expose refresh tokens or cookie sessions yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>The UI always calls backend routes through `lib/api`.</p>
            <p>401 responses clear the token and route you back to login.</p>
            <p>
              Correct and wrong answer states are explicit text, not color only.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
