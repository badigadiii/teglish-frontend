import type { ExerciseRead, ExerciseType } from "@/features/creator/types";
import { ApiError } from "@/lib/api/errors";

export function linesToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function listToLines(value?: string[]) {
  return value?.join("\n") ?? "";
}

export function exerciseTypeLabel(type: ExerciseType) {
  const labels: Record<ExerciseType, string> = {
    translate: "Перевод",
    grammar: "Грамматика",
    dictation: "Диктант",
  };

  return labels[type];
}

export function formatApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Запрос не выполнен";
}

export function summarizeExercise(exercise: ExerciseRead) {
  if (exercise.type === "dictation") {
    return exercise.payload.speech_text;
  }

  if (exercise.type === "grammar") {
    return exercise.payload.correct_answer;
  }

  return exercise.payload.correct_answers?.[0] ?? "Ответ не задан";
}
