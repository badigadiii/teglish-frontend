import type { ExerciseType, QuizSessionRead } from "@/features/student/types";

export function exerciseTypeLabel(type: ExerciseType) {
  const labels: Record<ExerciseType, string> = {
    translate: "Translate",
    grammar: "Grammar",
    dictation: "Dictation",
  };

  return labels[type];
}

export function scorePercent(correct: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Not finished";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function sessionScore(session: QuizSessionRead) {
  return `${session.correct_answers}/${session.total_questions} correct`;
}
