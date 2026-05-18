"use client";

import { useParams } from "next/navigation";
import { EmptyState } from "@/components/states/empty-state";
import { ExercisePlayer } from "@/features/exercises/components/exercise-player";

export default function PublicExercisePage() {
  const params = useParams<{ id: string }>();
  const exerciseId = Number(params.id);

  if (!Number.isFinite(exerciseId)) {
    return (
      <EmptyState
        actionHref="/"
        actionLabel="Back home"
        description="Exercise IDs must be numeric because the backend route expects an integer path parameter."
        title="Invalid exercise ID"
      />
    );
  }

  return <ExercisePlayer exerciseId={exerciseId} />;
}
