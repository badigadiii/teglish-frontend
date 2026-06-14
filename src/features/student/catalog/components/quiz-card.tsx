import { ArrowRight, ListChecks } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicQuiz } from "@/features/student/types";

export function QuizCard({ quiz }: { quiz: PublicQuiz }) {
  return (
    <Card className="bg-card/80">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary">
            <ListChecks className="size-5" />
          </div>
          <Badge variant="outline">{quiz.exercise_ids.length} questions</Badge>
        </div>
        <CardTitle className="text-xl tracking-normal">
          <Link href={`/quizzes/${quiz.id}`}>{quiz.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="min-h-12 text-sm leading-6 text-muted-foreground">
          {quiz.description || "Short public practice quiz."}
        </p>
        <Button asChild className="w-fit">
          <Link href={`/quizzes/${quiz.id}`}>
            Open
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
