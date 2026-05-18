"use client";

import {
  CheckCircle2Icon,
  CircleAlertIcon,
  RefreshCcwIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getExerciseQuestion, performExercise } from "@/lib/api/exercises";
import { normalizeMediaUrl } from "@/lib/api/media";
import type {
  ExerciseQuestionResponse,
  PerformExerciseRequest,
} from "@/lib/api/types";
import { ApiError } from "@/lib/errors/api-error";

type ExercisePlayerProps = {
  exerciseId: number;
};

function buildPayload(
  question: ExerciseQuestionResponse,
  answer: string,
): PerformExerciseRequest {
  if (question.type === "grammar") {
    return { type: "grammar", answer };
  }

  if (question.type === "translate") {
    return { type: "translate", answer };
  }

  return { type: "dictation", answer };
}

function getFeedbackText(message: "ok" | "wrong answer") {
  return message === "ok" ? "Ответ верный" : "Ответ неверный";
}

export function ExercisePlayer({ exerciseId }: ExercisePlayerProps) {
  const [question, setQuestion] = useState<ExerciseQuestionResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<
    "ok" | "wrong answer" | null
  >(null);
  const [submissionError, setSubmissionError] = useState<unknown>(null);

  const mediaUrl =
    question?.type === "dictation"
      ? normalizeMediaUrl(question.media_url)
      : null;
  const hasOptions =
    question?.type === "grammar" || question?.type === "translate"
      ? question.response_options.length > 0
      : false;
  const normalizedAnswer = useMemo(() => answer.trim(), [answer]);

  useEffect(() => {
    let isCancelled = false;

    async function loadQuestion() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const nextQuestion = await getExerciseQuestion(exerciseId);

        if (!isCancelled) {
          setQuestion(nextQuestion);
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadQuestion();

    return () => {
      isCancelled = true;
    };
  }, [exerciseId]);

  function updateAnswer(nextValue: string) {
    setAnswer(nextValue);
    setSelectedOption(nextValue);
    setFeedbackMessage(null);
    setSubmissionError(null);
  }

  async function handleSubmit() {
    if (!question || normalizedAnswer.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await performExercise(
        exerciseId,
        buildPayload(question, normalizedAnswer),
      );

      setFeedbackMessage(response.message);
      setSubmissionError(null);
    } catch (error) {
      setSubmissionError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reloadQuestion() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextQuestion = await getExerciseQuestion(exerciseId);
      setQuestion(nextQuestion);
    } catch (error) {
      setLoadError(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingState fullScreen label="Loading exercise question" />;
  }

  if (loadError) {
    if (loadError instanceof ApiError && loadError.status === 404) {
      return (
        <ErrorState
          actionHref="/"
          actionLabel="Back to home"
          description="Public exercise routes depend on `/exercises/{id}/question`. The backend did not find this exercise."
          error={loadError}
          retryLabel="Try again"
          title="Exercise not found"
          onRetry={reloadQuestion}
        />
      );
    }

    return (
      <ErrorState
        actionHref="/"
        actionLabel="Back to home"
        description="The player could not load the public question endpoint."
        error={loadError}
        retryLabel="Reload question"
        title="Unable to load exercise"
        onRetry={reloadQuestion}
      />
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`Exercise #${exerciseId}`}
        title="Public exercise player"
        description="This route uses the public question and perform endpoints, so learners can practice a single exercise without signing in."
        actions={
          <>
            <Badge variant="secondary">{question.type}</Badge>
            <Badge variant="outline">Stage 5</Badge>
          </>
        }
      />

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-2xl">{question.exercise_text}</CardTitle>
          </div>
          <CardDescription>
            {question.type === "dictation"
              ? "Listen carefully and type exactly what you hear."
              : "Choose an option or enter your own answer, then submit it for validation."}
          </CardDescription>
          <Progress
            value={feedbackMessage === "ok" ? 100 : feedbackMessage ? 55 : 18}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {question.type === "dictation" ? (
            <div className="space-y-4">
              <audio
                className="w-full"
                controls
                preload="metadata"
                src={mediaUrl ?? undefined}
              >
                <track
                  default
                  kind="captions"
                  label="Captions unavailable"
                  src={"data:text/vtt,WEBVTT"}
                />
              </audio>
              <p className="text-sm text-muted-foreground">
                Backend comparison for dictation is normalization-friendly, but
                you still need the correct spoken text.
              </p>
              <Textarea
                className="min-h-32"
                onChange={(event) => updateAnswer(event.target.value)}
                placeholder="Type what you hear"
                value={answer}
              />
            </div>
          ) : (
            <div className="space-y-5">
              {hasOptions ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {question.response_options.map((option) => {
                    const isSelected = selectedOption === option;

                    return (
                      <Button
                        className="h-auto min-h-16 justify-start rounded-2xl px-5 py-4 text-left text-base"
                        key={option}
                        onClick={() => updateAnswer(option)}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="manual-answer">
                  Manual answer
                </label>
                <Input
                  id="manual-answer"
                  onChange={(event) => updateAnswer(event.target.value)}
                  placeholder="Enter your answer"
                  value={answer}
                />
              </div>
            </div>
          )}

          <Separator />

          {feedbackMessage ? (
            <Alert
              variant={feedbackMessage === "ok" ? "default" : "destructive"}
            >
              {feedbackMessage === "ok" ? (
                <CheckCircle2Icon className="size-4" />
              ) : (
                <CircleAlertIcon className="size-4" />
              )}
              <AlertTitle>{getFeedbackText(feedbackMessage)}</AlertTitle>
              <AlertDescription>
                {feedbackMessage === "ok"
                  ? "The backend accepted this answer."
                  : "The backend marked this answer as incorrect. Try another response."}
              </AlertDescription>
            </Alert>
          ) : null}

          {submissionError ? (
            <ErrorState
              description="The answer could not be submitted. If the error mentions exercise type mismatch, the UI payload no longer matches the backend contract."
              error={submissionError}
              retryLabel="Retry submit"
              title="Submission failed"
              onRetry={handleSubmit}
            />
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={normalizedAnswer.length === 0 || isSubmitting}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? "Checking answer..." : "Submit answer"}
            </Button>
            <Button
              onClick={() => {
                setAnswer("");
                setSelectedOption(null);
                setFeedbackMessage(null);
                setSubmissionError(null);
              }}
              type="button"
              variant="outline"
            >
              <RefreshCcwIcon />
              Reset answer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
