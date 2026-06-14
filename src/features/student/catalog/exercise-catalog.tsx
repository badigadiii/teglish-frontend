"use client";

import { useQuery } from "@tanstack/react-query";
import { Dumbbell } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicExercises } from "@/features/student/api";
import { CatalogPagination } from "@/features/student/catalog/components/catalog-pagination";
import { ExerciseCard } from "@/features/student/catalog/components/exercise-card";
import { studentKeys } from "@/features/student/query-keys";

export function ExerciseCatalog({
  page,
  size,
}: {
  page: number;
  size: number;
}) {
  const exercisesQuery = useQuery({
    queryKey: studentKeys.exercises(page, size),
    queryFn: () => getPublicExercises(page, size),
  });

  const exercises = exercisesQuery.data?.items ?? [];

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <div className="grid size-11 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
          <Dumbbell className="size-5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-normal">
          Public exercises
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Practice one exercise at a time with backend evaluation.
        </p>
      </section>

      {exercisesQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-52 rounded-lg" />
          <Skeleton className="h-52 rounded-lg" />
        </div>
      ) : null}

      {exercisesQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {exercisesQuery.error instanceof Error
              ? exercisesQuery.error.message
              : "Failed to load exercises"}
          </AlertDescription>
        </Alert>
      ) : null}

      {!exercisesQuery.isLoading && exercises.length === 0 ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          No public exercises yet.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {exercisesQuery.data ? (
        <CatalogPagination
          basePath="/exercises"
          page={exercisesQuery.data.page}
          pages={exercisesQuery.data.pages}
          size={exercisesQuery.data.size}
        />
      ) : null}
    </div>
  );
}
