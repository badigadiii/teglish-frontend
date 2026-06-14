"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Flag, StepForward } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { answerQuizSession, finishQuizSession } from "@/features/student/api";
import { QuestionRenderer } from "@/features/student/player/components/question-renderer";
import { QuizFeedback } from "@/features/student/player/components/quiz-feedback";
import { QuizProgress } from "@/features/student/player/components/quiz-progress";
import type {
  AnswerFeedback,
  QuizAnswerResponse,
  QuizStartResponse,
} from "@/features/student/types";

export function QuizPlayer({
  quizId,
  sessionId,
}: {
  quizId: number;
  sessionId: number | null;
}) {
  const router = useRouter();
  const [session, setSession] = useState<QuizStartResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [finishedLocally, setFinishedLocally] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const raw = window.localStorage.getItem(
      `teglish.quiz-session.${sessionId}`,
    );
    if (raw) {
      setSession(JSON.parse(raw) as QuizStartResponse);
    }
  }, [sessionId]);

  const currentQuestion = useMemo(() => {
    return session?.questions[currentIndex] ?? null;
  }, [session, currentIndex]);

  const answerMutation = useMutation({
    mutationFn: (answer: string) => {
      if (!sessionId || !currentQuestion) {
        throw new Error("Quiz session is not ready");
      }

      return answerQuizSession(sessionId, {
        exercise_id: currentQuestion.exercise_id,
        answer,
      });
    },
    onSuccess: (response: QuizAnswerResponse) => {
      setSession((previous) => {
        if (!previous) {
          return previous;
        }

        const next = {
          ...previous,
          answered_questions: response.answered_questions,
          correct_answers: response.correct_answers,
        };
        window.localStorage.setItem(
          `teglish.quiz-session.${next.id}`,
          JSON.stringify(next),
        );

        return next;
      });
      setFeedback(
        response.is_correct
          ? { status: "correct", message: "Correct" }
          : { status: "wrong", message: "Wrong answer" },
      );
    },
  });

  const finishMutation = useMutation({
    mutationFn: () => {
      if (!sessionId) {
        throw new Error("Quiz session is not ready");
      }

      return finishQuizSession(sessionId);
    },
    onSuccess: (detail) => {
      window.localStorage.removeItem(`teglish.quiz-session.${detail.id}`);
      setFinishedLocally(true);
      router.push(`/results/quiz-sessions/${detail.id}`);
    },
  });

  if (!sessionId) {
    return <MissingSession quizId={quizId} />;
  }

  if (!session) {
    return (
      <MissingSession quizId={quizId}>
        Active quiz questions are only available immediately after start.
      </MissingSession>
    );
  }

  if (!currentQuestion) {
    return <MissingSession quizId={quizId}>No question found.</MissingSession>;
  }

  const isLast = currentIndex >= session.questions.length - 1;
  const controlsDisabled =
    answerMutation.isPending || finishMutation.isPending || finishedLocally;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
      <Card className="bg-card/80">
        <CardHeader className="gap-4">
          <Button asChild variant="ghost" className="w-fit">
            <Link href={`/quizzes/${quizId}`}>
              <ArrowLeft className="size-4" />
              Quiz detail
            </Link>
          </Button>
          <QuizProgress session={session} currentIndex={currentIndex} />
        </CardHeader>
        <CardContent className="grid gap-5">
          <QuestionRenderer
            question={currentQuestion.question}
            disabled={controlsDisabled || feedback !== null}
            onSubmit={(answer) => answerMutation.mutate(answer)}
          />
          <QuizFeedback feedback={feedback} />
          {answerMutation.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {answerMutation.error instanceof Error
                  ? answerMutation.error.message
                  : "Answer was not submitted"}
              </AlertDescription>
            </Alert>
          ) : null}
          {finishMutation.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {finishMutation.error instanceof Error
                  ? finishMutation.error.message
                  : "Quiz was not finished"}
              </AlertDescription>
            </Alert>
          ) : null}
          {feedback ? (
            <div className="flex flex-wrap gap-3">
              {isLast ? (
                <Button
                  type="button"
                  onClick={() => finishMutation.mutate()}
                  disabled={finishMutation.isPending}
                >
                  {finishMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <Flag className="size-4" />
                  )}
                  Finish quiz
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setCurrentIndex((index) => index + 1);
                  }}
                >
                  <StepForward className="size-4" />
                  Next question
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="h-fit bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg tracking-normal">Session</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Counter label="Answered" value={session.answered_questions} />
          <Counter label="Correct" value={session.correct_answers} />
          <Counter
            label="Remaining"
            value={Math.max(
              0,
              session.total_questions - session.answered_questions,
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function MissingSession({
  quizId,
  children,
}: {
  quizId: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-80 w-full place-items-center">
      <Card className="w-full bg-card/80">
        <CardHeader>
          <CardTitle className="tracking-normal">Session unavailable</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            {children ?? "Start the quiz again to load its questions."}
          </p>
          <Button asChild className="w-fit">
            <Link href={`/quizzes/${quizId}`}>Start again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
