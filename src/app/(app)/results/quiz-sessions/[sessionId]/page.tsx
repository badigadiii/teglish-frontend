import { QuizResultPage } from "@/features/student/results/quiz-result-page";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return <QuizResultPage sessionId={Number(sessionId)} />;
}
