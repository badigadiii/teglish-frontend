"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  Headphones,
  LibraryBig,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createExercise,
  createQuiz,
  deleteExercise,
  deleteMedia,
  deleteQuiz,
  getMyExercises,
  getMyMedia,
  getMyQuizzes,
  updateExercise,
  updateQuiz,
  uploadMedia,
} from "@/features/creator/api";
import { DeleteConfirmation } from "@/features/creator/components/delete-confirmation";
import { ExerciseModal } from "@/features/creator/components/exercise-modal";
import { MediaPanel } from "@/features/creator/components/media-panel";
import { QuizModal } from "@/features/creator/components/quiz-modal";
import { creatorKeys } from "@/features/creator/query-keys";
import type {
  ExercisePayload,
  ExerciseRead,
  QuizPayload,
  QuizRead,
} from "@/features/creator/types";
import {
  exerciseTypeLabel,
  formatApiError,
  summarizeExercise,
} from "@/features/creator/utils";

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
  const quizzesQuery = useQuery({
    queryKey: creatorKeys.quizzes(),
    queryFn: getMyQuizzes,
  });
  const mediaQuery = useQuery({
    queryKey: creatorKeys.media(1, 20),
    queryFn: () => getMyMedia(1, 20),
  });

  const exercises = exercisesQuery.data?.items ?? [];
  const quizzes = quizzesQuery.data?.items ?? [];
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

  const deleteExerciseMutation = useMutation({
    mutationFn: deleteExercise,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: creatorKeys.exercises() }),
  });

  const deleteQuizMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: creatorKeys.quizzes() }),
  });

  const uploadMediaMutation = useMutation({
    mutationFn: ({ file, name }: { file: File; name?: string }) =>
      uploadMedia(file, name),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: creatorKeys.all }),
  });

  const deleteMediaMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: creatorKeys.all }),
  });

  function openNewExercise() {
    setEditingExercise(undefined);
    setExerciseModalOpen(true);
  }

  function openEditExercise(exercise: ExerciseRead) {
    setEditingExercise(exercise);
    setExerciseModalOpen(true);
  }

  function openNewQuiz() {
    setEditingQuiz(undefined);
    setQuizModalOpen(true);
  }

  function openEditQuiz(quiz: QuizRead) {
    setEditingQuiz(quiz);
    setQuizModalOpen(true);
  }

  const pageError =
    exercisesQuery.error ?? quizzesQuery.error ?? mediaQuery.error ?? null;

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

      <Tabs defaultValue="exercises">
        <TabsList>
          <TabsTrigger value="exercises">
            <Wand2 className="size-4" />
            Упражнения
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <LibraryBig className="size-4" />
            Квизы
          </TabsTrigger>
          <TabsTrigger value="media">
            <Headphones className="size-4" />
            Медиа
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises">
          <ExerciseList
            exercises={exercises}
            loading={exercisesQuery.isLoading}
            deletePending={deleteExerciseMutation.isPending}
            onCreate={openNewExercise}
            onEdit={openEditExercise}
            onDelete={(id) => deleteExerciseMutation.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="quizzes">
          <QuizList
            quizzes={quizzes}
            loading={quizzesQuery.isLoading}
            deletePending={deleteQuizMutation.isPending}
            onCreate={openNewQuiz}
            onEdit={openEditQuiz}
            onDelete={(id) => deleteQuizMutation.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="media">
          <MediaPanel
            media={media}
            uploadPending={uploadMediaMutation.isPending}
            deletePending={deleteMediaMutation.isPending}
            error={uploadMediaMutation.error ?? deleteMediaMutation.error}
            onUpload={(file, name) =>
              uploadMediaMutation.mutate({ file, name })
            }
            onDelete={(filename) => deleteMediaMutation.mutate(filename)}
          />
        </TabsContent>
      </Tabs>

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

function ExerciseList({
  exercises,
  loading,
  deletePending,
  onCreate,
  onEdit,
  onDelete,
}: {
  exercises: ExerciseRead[];
  loading: boolean;
  deletePending: boolean;
  onCreate: () => void;
  onEdit: (exercise: ExerciseRead) => void;
  onDelete: (id: number) => void;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">Загрузка упражнений...</CardContent>
      </Card>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="grid gap-3 py-8">
          <p className="text-sm text-muted-foreground">
            Упражнений пока нет. Создайте перевод, грамматику или диктант.
          </p>
          <Button className="w-fit" type="button" onClick={onCreate}>
            <Plus className="size-4" />
            Создать упражнение
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {exercises.map((exercise) => (
        <Card key={exercise.id}>
          <CardHeader>
            <CardTitle className="line-clamp-2">
              {exercise.exercise_text}
            </CardTitle>
            <CardAction>
              <Badge variant={exercise.public ? "default" : "outline"}>
                {exercise.public ? "Публично" : "Приватно"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {exerciseTypeLabel(exercise.type)}
              </Badge>
              <Badge variant="outline">#{exercise.id}</Badge>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {summarizeExercise(exercise)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onEdit(exercise)}
              >
                <Edit3 className="size-4" />
                Изменить
              </Button>
              <DeleteConfirmation
                title="Удалить упражнение?"
                description="Упражнение исчезнет из вашего списка. Если оно входит в квизы, backend может отказать в удалении."
                onConfirm={() => onDelete(exercise.id)}
              >
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deletePending}
                >
                  <Trash2 className="size-4" />
                  Удалить
                </Button>
              </DeleteConfirmation>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuizList({
  quizzes,
  loading,
  deletePending,
  onCreate,
  onEdit,
  onDelete,
}: {
  quizzes: QuizRead[];
  loading: boolean;
  deletePending: boolean;
  onCreate: () => void;
  onEdit: (quiz: QuizRead) => void;
  onDelete: (id: number) => void;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">Загрузка квизов...</CardContent>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="grid gap-3 py-8">
          <p className="text-sm text-muted-foreground">
            Квизов пока нет. Соберите первый квиз из своих упражнений.
          </p>
          <Button className="w-fit" type="button" onClick={onCreate}>
            <Plus className="size-4" />
            Создать квиз
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {quizzes.map((quiz) => (
        <Card key={quiz.id}>
          <CardHeader>
            <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
            <CardAction>
              <Badge variant={quiz.public ? "default" : "outline"}>
                {quiz.public ? "Публично" : "Приватно"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {quiz.description || "Без описания"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {quiz.exercise_ids.length} упражнений
              </Badge>
              <Badge variant="outline">#{quiz.id}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onEdit(quiz)}
              >
                <Edit3 className="size-4" />
                Изменить
              </Button>
              <DeleteConfirmation
                title="Удалить квиз?"
                description="Квиз исчезнет из вашего списка и публичного каталога."
                onConfirm={() => onDelete(quiz.id)}
              >
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deletePending}
                >
                  <Trash2 className="size-4" />
                  Удалить
                </Button>
              </DeleteConfirmation>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
