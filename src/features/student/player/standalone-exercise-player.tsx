"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getExerciseQuestion, performExercise } from "@/features/student/api";
import { QuestionRenderer } from "@/features/student/player/components/question-renderer";
import { QuizFeedback } from "@/features/student/player/components/quiz-feedback";
import { studentKeys } from "@/features/student/query-keys";
import type { AnswerFeedback } from "@/features/student/types";

export function StandaloneExercisePlayer({
  exerciseId,
}: {
  exerciseId: number;
}) {
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const questionQuery = useQuery({
    queryKey: studentKeys.exerciseQuestion(exerciseId),
    queryFn: () => getExerciseQuestion(exerciseId),
    retry: false,
  });
  const performMutation = useMutation({
    mutationFn: (answer: string) => {
      if (!questionQuery.data) {
        throw new Error("Вопрос не загружен");
      }

      return performExercise(exerciseId, {
        type: questionQuery.data.type,
        answer,
      });
    },
    onSuccess: (response) => {
      setFeedback(
        response.message === "ok"
          ? { status: "correct", message: "Верно" }
          : { status: "wrong", message: "Неверный ответ" },
      );
    },
  });

  return (
    <div className="grid gap-5">
      <Card className="bg-card/80">
        <CardHeader className="gap-4">
          <Button asChild variant="ghost" className="w-fit">
            <Link href="/exercises">
              <ArrowLeft className="size-4" />
              Упражнения
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-normal">Упражнение</h1>
        </CardHeader>
        <CardContent className="grid gap-5">
          {questionQuery.isLoading ? <Spinner /> : null}
          {questionQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {questionQuery.error instanceof Error
                  ? questionQuery.error.message
                  : "Не удалось загрузить упражнение"}
              </AlertDescription>
            </Alert>
          ) : null}
          {questionQuery.data ? (
            <QuestionRenderer
              question={questionQuery.data}
              disabled={performMutation.isPending}
              onSubmit={(answer) => performMutation.mutate(answer)}
            />
          ) : null}
          <QuizFeedback feedback={feedback} />
          {performMutation.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {performMutation.error instanceof Error
                  ? performMutation.error.message
                  : "Ответ не был отправлен"}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
