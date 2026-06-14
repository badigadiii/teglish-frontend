import { StandaloneExercisePlayer } from "@/features/student/player/standalone-exercise-player";

export default async function ExercisePlayPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;

  return <StandaloneExercisePlayer exerciseId={Number(exerciseId)} />;
}
