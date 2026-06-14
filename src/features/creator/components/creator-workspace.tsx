"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LibraryBig, Plus } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  createExercise,
  createQuiz,
  getMyExercises,
  getMyMedia,
  updateExercise,
  updateQuiz,
  uploadMedia,
} from "@/features/creator/api";
import { ExerciseModal } from "@/features/creator/components/exercise-modal";
import { MediaUploadPanel } from "@/features/creator/components/media-panel";
import { QuizModal } from "@/features/creator/components/quiz-modal";
import { creatorKeys } from "@/features/creator/query-keys";
import type {
  ExercisePayload,
  ExerciseRead,
  QuizPayload,
  QuizRead,
} from "@/features/creator/types";
import { formatApiError } from "@/features/creator/utils";

export function CreatorWorkspace() {
  const queryClient = useQueryClient();
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseRead>();
  const [editingQuiz, setEditingQuiz] = useState<QuizRead>();

  const exercisesQuery = useQuery({
    queryKey: creatorKeys.exercises(),
    queryFn: getMyExercises,
  });
  const mediaQuery = useQuery({
    queryKey: creatorKeys.media(1, 20),
    queryFn: () => getMyMedia(1, 20),
  });

  const exercises = exercisesQuery.data?.items ?? [];
  const media = mediaQuery.data?.items ?? [];

  const saveExerciseMutation = useMutation({
    mutationFn: (payload: ExercisePayload) =>
      editingExercise
        ? updateExercise(editingExercise.id, payload)
        : createExercise(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: creatorKeys.exercises(),
      });
      setExerciseModalOpen(false);
      setEditingExercise(undefined);
    },
  });

  const saveQuizMutation = useMutation({
    mutationFn: (payload: QuizPayload) =>
      editingQuiz ? updateQuiz(editingQuiz.id, payload) : createQuiz(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creatorKeys.quizzes() });
      setQuizModalOpen(false);
      setEditingQuiz(undefined);
    },
  });

  const uploadMediaMutation = useMutation({
    mutationFn: ({ file, name }: { file: File; name?: string }) =>
      uploadMedia(file, name),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: creatorKeys.all }),
  });

  function openNewExercise() {
    setEditingExercise(undefined);
    setExerciseModalOpen(true);
  }

  function openNewQuiz() {
    setEditingQuiz(undefined);
    setQuizModalOpen(true);
  }

  const pageError = exercisesQuery.error ?? mediaQuery.error ?? null;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Create</h1>
          <p className="text-sm text-muted-foreground">
            Управление упражнениями, квизами и медиафайлами.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={openNewExercise}>
            <Plus className="size-4" />
            Упражнение
          </Button>
          <Button type="button" variant="secondary" onClick={openNewQuiz}>
            <LibraryBig className="size-4" />
            Квиз
          </Button>
        </div>
      </div>

      {pageError && (
        <Alert variant="destructive">
          <AlertDescription>{formatApiError(pageError)}</AlertDescription>
        </Alert>
      )}

      <MediaUploadPanel
        uploadPending={uploadMediaMutation.isPending}
        error={uploadMediaMutation.error}
        onUpload={(file, name) => uploadMediaMutation.mutate({ file, name })}
      />

      <ExerciseModal
        open={exerciseModalOpen}
        exercise={editingExercise}
        media={media}
        pending={saveExerciseMutation.isPending}
        error={saveExerciseMutation.error}
        onOpenChange={(open) => {
          setExerciseModalOpen(open);
          if (!open) {
            setEditingExercise(undefined);
            saveExerciseMutation.reset();
          }
        }}
        onSubmit={(payload) => saveExerciseMutation.mutate(payload)}
      />

      <QuizModal
        open={quizModalOpen}
        quiz={editingQuiz}
        exercises={exercises}
        pending={saveQuizMutation.isPending}
        error={saveQuizMutation.error}
        onOpenChange={(open) => {
          setQuizModalOpen(open);
          if (!open) {
            setEditingQuiz(undefined);
            saveQuizMutation.reset();
          }
        }}
        onSubmit={(payload) => saveQuizMutation.mutate(payload)}
      />
    </div>
  );
}
