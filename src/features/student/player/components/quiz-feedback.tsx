import { CheckCircle2, XCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AnswerFeedback } from "@/features/student/types";

export function QuizFeedback({
  feedback,
}: {
  feedback: AnswerFeedback | null;
}) {
  if (!feedback) {
    return null;
  }

  const Icon = feedback.status === "correct" ? CheckCircle2 : XCircle;

  return (
    <Alert variant={feedback.status === "correct" ? "default" : "destructive"}>
      <Icon className="size-4" />
      <AlertDescription>{feedback.message}</AlertDescription>
    </Alert>
  );
}
