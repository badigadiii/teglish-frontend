"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getPublicQuiz, startQuiz } from "@/features/student/api";
import { studentKeys } from "@/features/student/query-keys";
import { ApiError } from "@/lib/api/errors";

export function QuizDetail({ quizId }: { quizId: number }) {
  const router = useRouter();
  const quizQuery = useQuery({
    queryKey: studentKeys.quiz(quizId),
    queryFn: () => getPublicQuiz(quizId),
    retry: false,
  });
  const startMutation = useMutation({
    mutationFn: () => startQuiz(quizId),
    onSuccess: (session) => {
      window.localStorage.setItem(
        `teglish.quiz-session.${session.id}`,
        JSON.stringify(session),
      );
      router.push(`/quizzes/${quizId}/play?sessionId=${session.id}`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        router.push(
          `/?mode=login&next=${encodeURIComponent(`/quizzes/${quizId}`)}`,
        );
      }
    },
  });

  if (quizQuery.isLoading) {
    return (
      <div className="grid min-h-80 place-items-center">
        <Spinner />
      </div>
    );
  }

  if (quizQuery.isError) {
    return (
      <div className="mx-auto grid min-h-screen w-full max-w-4xl place-items-center px-4 py-8">
        <Card className="w-full bg-card/80">
          <CardHeader>
            <h1 className="text-3xl font-semibold tracking-normal">
              Quiz not found
            </h1>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              This quiz is private, missing, or unavailable.
            </p>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/quizzes">
                <ArrowLeft className="size-4" />
                Back to quizzes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quiz = quizQuery.data;

  if (!quiz) {
    return null;
  }

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-5xl gap-6 px-4 py-8">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/quizzes">
          <ArrowLeft className="size-4" />
          Back to quizzes
        </Link>
      </Button>

      <Card className="bg-card/80">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Public quiz</Badge>
            <Badge>{quiz.exercise_ids.length} questions</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-normal">
            {quiz.title}
          </h1>
        </CardHeader>
        <CardContent className="grid gap-6">
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            {quiz.description ||
              "Start this training quiz and get feedback after each answer."}
          </p>

          {startMutation.isError &&
          !(
            startMutation.error instanceof ApiError &&
            startMutation.error.status === 401
          ) ? (
            <Alert variant="destructive">
              <AlertDescription>
                {startMutation.error instanceof Error
                  ? startMutation.error.message
                  : "Failed to start quiz"}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              size="lg"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
            >
              {startMutation.isPending ? (
                <Spinner />
              ) : (
                <Play className="size-4" />
              )}
              Start quiz
            </Button>
            <Button asChild type="button" variant="outline" size="lg">
              <Link href="/quizzes">
                <RotateCcw className="size-4" />
                Choose another
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
