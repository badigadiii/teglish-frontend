import { QuizDetail } from "@/features/student/catalog/quiz-detail";

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;

  return <QuizDetail quizId={Number(quizId)} />;
}
