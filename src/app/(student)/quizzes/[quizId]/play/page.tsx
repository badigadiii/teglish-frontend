import { QuizPlayer } from "@/features/student/player/quiz-player";

export default async function QuizPlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const [{ quizId }, query] = await Promise.all([params, searchParams]);
  const parsedSessionId = Number(query.sessionId);

  return (
    <QuizPlayer
      quizId={Number(quizId)}
      sessionId={Number.isFinite(parsedSessionId) ? parsedSessionId : null}
    />
  );
}
