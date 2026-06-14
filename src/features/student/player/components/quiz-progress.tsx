import type { QuizStartResponse } from "@/features/student/types";

export function QuizProgress({
  session,
  currentIndex,
}: {
  session: Pick<
    QuizStartResponse,
    "total_questions" | "answered_questions" | "correct_answers"
  >;
  currentIndex: number;
}) {
  const total = Math.max(1, session.total_questions);
  const progress = Math.min(
    100,
    Math.round(((currentIndex + 1) / total) * 100),
  );

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">
          Question {Math.min(currentIndex + 1, total)} of {total}
        </span>
        <span className="text-muted-foreground">
          Right answers: {session.correct_answers}/{session.answered_questions}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
