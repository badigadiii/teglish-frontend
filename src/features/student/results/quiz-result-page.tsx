"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, History, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getQuizSession } from "@/features/student/api";
import { studentKeys } from "@/features/student/query-keys";
import {
  formatDateTime,
  quizSessionStatusLabel,
  scorePercent,
  sessionScore,
} from "@/features/student/utils";

export function QuizResultPage({ sessionId }: { sessionId: number }) {
  const sessionQuery = useQuery({
    queryKey: studentKeys.quizSession(sessionId),
    queryFn: () => getQuizSession(sessionId),
    retry: false,
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="grid min-h-80 place-items-center">
        <Spinner />
      </div>
    );
  }

  if (sessionQuery.isError) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertDescription>
            {sessionQuery.error instanceof Error
              ? sessionQuery.error.message
              : "Не удалось загрузить результат квиза"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const session = sessionQuery.data;

  if (!session) {
    return null;
  }

  const percent = scorePercent(
    session.correct_answers,
    session.total_questions,
  );

  return (
    <div className="grid gap-5">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/quizzes">
          <ArrowLeft className="size-4" />
          Квизы
        </Link>
      </Button>

      <Card className="bg-card/80">
        <CardHeader className="gap-3">
          <Badge className="w-fit">
            {quizSessionStatusLabel(session.status)}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-normal">
            Результат квиза
          </h1>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="Результат" value={sessionScore(session)} />
            <Stat label="Отвечено" value={`${session.answered_questions}`} />
            <Stat label="Всего" value={`${session.total_questions}`} />
            <Stat label="Процент" value={`${percent}%`} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Info label="Начато" value={formatDateTime(session.started_at)} />
            <Info
              label="Завершено"
              value={formatDateTime(session.finished_at)}
            />
          </div>

          <div className="grid gap-3">
            <h2 className="text-xl font-semibold tracking-normal">Попытки</h2>
            {session.attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Нет подтвержденных попыток.
              </p>
            ) : (
              session.attempts.map((attempt) => (
                <div
                  key={`${attempt.exercise_id}-${attempt.answered_at}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <strong>Упражнение №{attempt.exercise_id}</strong>
                    <p className="text-sm text-muted-foreground">
                      {attempt.answer}
                    </p>
                  </div>
                  <Badge
                    variant={attempt.is_correct ? "default" : "destructive"}
                  >
                    {attempt.is_correct ? "Верно" : "Неверный ответ"}
                  </Badge>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/quizzes/${session.quiz_id}`}>
                <RotateCcw className="size-4" />
                Перепройти квиз
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile/attempts">
                <History className="size-4" />
                Попытки в профиле
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
