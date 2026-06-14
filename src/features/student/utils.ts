import type { ExerciseType, QuizSessionRead } from "@/features/student/types";

export function exerciseTypeLabel(type: ExerciseType) {
  const labels: Record<ExerciseType, string> = {
    translate: "Перевод",
    grammar: "Грамматика",
    dictation: "Диктант",
  };

  return labels[type];
}

export function formatQuestionCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} вопрос`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} вопроса`;
  }

  return `${count} вопросов`;
}

export function quizSessionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "Активно",
    completed: "Завершено",
    started: "В процессе",
    finished: "Завершено",
    pending: "Ожидает",
  };

  return labels[status] ?? status;
}

export function quizSessionStatusAccent(status: string) {
  const accents: Record<string, string | undefined> = {
    active:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300",
    finished:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-300",
  };

  return accents[status];
}

export function scorePercent(correct: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Не завершено";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function sessionScore(session: QuizSessionRead) {
  return `${session.correct_answers}/${session.total_questions} верно`;
}
