"use client";

import { Headphones, Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { StudentQuestion } from "@/features/student/types";
import { exerciseTypeLabel } from "@/features/student/utils";

export function QuestionRenderer({
  question,
  disabled,
  onSubmit,
}: {
  question: StudentQuestion;
  disabled?: boolean;
  onSubmit: (answer: string) => void;
}) {
  const [answer, setAnswer] = useState("");
  const hasChoices =
    "response_options" in question && question.response_options.length > 0;

  function submitText(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = answer.trim();

    if (value) {
      onSubmit(value);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <span className="text-sm font-semibold uppercase text-muted-foreground">
          {exerciseTypeLabel(question.type)}
        </span>
        <h2 className="text-2xl font-semibold tracking-normal">
          {question.exercise_text}
        </h2>
      </div>

      {question.type === "dictation" ? (
        <div className="grid gap-2 rounded-lg border p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Headphones className="size-4" />
            Аудио для диктанта
          </div>
          <audio controls src={question.media_url} className="w-full">
            <track kind="captions" />
          </audio>
        </div>
      ) : null}

      {hasChoices ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {question.response_options.map((option) => (
            <Button
              key={option}
              type="button"
              variant="outline"
              className="h-auto justify-start whitespace-normal py-3 text-left"
              disabled={disabled}
              onClick={() => onSubmit(option)}
            >
              {disabled ? <Spinner /> : null}
              {option}
            </Button>
          ))}
        </div>
      ) : (
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submitText}>
          <div className="grid flex-1 gap-2">
            <Label htmlFor="student-answer">Ответ</Label>
            <Input
              id="student-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={disabled}
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            className="self-end"
            disabled={disabled || answer.trim().length === 0}
          >
            {disabled ? <Spinner /> : <Send className="size-4" />}
            Отправить ответ
          </Button>
        </form>
      )}
    </div>
  );
}
