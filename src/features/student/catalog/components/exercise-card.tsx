import { ArrowRight, Dumbbell } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicExercise } from "@/features/student/types";
import { exerciseTypeLabel } from "@/features/student/utils";

export function ExerciseCard({ exercise }: { exercise: PublicExercise }) {
  return (
    <Card className="bg-card/80">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
            <Dumbbell className="size-5" />
          </div>
          <Badge variant="outline">{exerciseTypeLabel(exercise.type)}</Badge>
        </div>
        <CardTitle className="text-xl tracking-normal">
          {exercise.exercise_text}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Публичное упражнение №{exercise.id}
        </p>
        <Button asChild className="w-fit">
          <Link href={`/exercises/${exercise.id}/play`}>
            Практиковаться
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
