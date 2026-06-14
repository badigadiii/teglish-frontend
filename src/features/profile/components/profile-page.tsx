"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Headphones,
  LibraryBig,
  ListChecks,
  Upload,
  User,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRead } from "@/features/auth/types";
import {
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
import { ExerciseModal } from "@/features/creator/components/exercise-modal";
import { MediaUploadDialog } from "@/features/creator/components/media-panel";
import { QuizModal } from "@/features/creator/components/quiz-modal";
import {
  ExerciseCardGrid,
  MediaList,
  QuizCardGrid,
} from "@/features/creator/components/resource-cards";
import { creatorKeys } from "@/features/creator/query-keys";
import type {
  ExercisePayload,
  ExerciseRead,
  MediaRead,
  QuizPayload,
  QuizRead,
} from "@/features/creator/types";
import { formatApiError } from "@/features/creator/utils";
import { getMyQuizSessions } from "@/features/student/api";
import { studentKeys } from "@/features/student/query-keys";
import {
  formatDateTime,
  quizSessionStatusAccent,
  quizSessionStatusLabel,
  sessionScore,
} from "@/features/student/utils";

export function ProfilePage({
  user,
  section = "overview",
}: {
  user: UserRead;
  section?: "overview" | "exercises" | "quizzes" | "media" | "attempts";
}) {
  const queryClient = useQueryClient();
  const [editingExercise, setEditingExercise] = useState<ExerciseRead>();
  const [editingQuiz, setEditingQuiz] = useState<QuizRead>();
  const [mediaUploadOpen, setMediaUploadOpen] = useState(false);

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
  const sessionsQuery = useQuery({
    queryKey: studentKeys.mySessions(1, 20),
    queryFn: () => getMyQuizSessions(1, 20),
  });

  const exercises = exercisesQuery.data?.items ?? [];
  const quizzes = quizzesQuery.data?.items ?? [];
  const media = mediaQuery.data?.items ?? [];
  const sessions = sessionsQuery.data?.items ?? [];

  const uploadMediaMutation = useMutation({
    mutationFn: ({ file, name }: { file: File; name?: string }) =>
      uploadMedia(file, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: creatorKeys.media(1, 20),
      });
    },
  });

  const saveExerciseMutation = useMutation({
    mutationFn: (payload: ExercisePayload) => {
      if (!editingExercise) {
        throw new Error("Упражнение для редактирования не выбрано");
      }

      return updateExercise(editingExercise.id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: creatorKeys.exercises(),
      });
      setEditingExercise(undefined);
    },
  });

  const saveQuizMutation = useMutation({
    mutationFn: (payload: QuizPayload) => {
      if (!editingQuiz) {
        throw new Error("Квиз для редактирования не выбран");
      }

      return updateQuiz(editingQuiz.id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creatorKeys.quizzes() });
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

  const deleteMediaMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: creatorKeys.all }),
  });

  const pageError =
    exercisesQuery.error ??
    quizzesQuery.error ??
    mediaQuery.error ??
    sessionsQuery.error ??
    deleteExerciseMutation.error ??
    deleteQuizMutation.error ??
    deleteMediaMutation.error ??
    null;

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          {sectionTitle(section)}
        </h1>
        <p className="text-sm text-muted-foreground">
          Личные данные и материалы аккаунта @{user.username}.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <ProfileLink href="/profile" label="Профиль" icon={User} />
        <ProfileLink
          href="/profile/exercises"
          label="Упражнения"
          icon={Wand2}
        />
        <ProfileLink href="/profile/quizzes" label="Квизы" icon={LibraryBig} />
        <ProfileLink href="/profile/media" label="Медиа" icon={Headphones} />
        <ProfileLink
          href="/profile/attempts"
          label="Попытки"
          icon={ListChecks}
        />
      </div>

      {pageError ? (
        <Alert variant="destructive">
          <AlertDescription>{formatApiError(pageError)}</AlertDescription>
        </Alert>
      ) : null}

      {section === "overview" && (
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Row label="Username" value={`@${user.username}`} />
              <Row label="Role" value={user.role} />
              <Row
                label="Status"
                value={user.is_active ? "active" : "inactive"}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Контент</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Упражнения" value={exercises.length} />
              <Stat label="Квизы" value={quizzes.length} />
              <Stat label="Медиа" value={media.length} />
            </CardContent>
          </Card>
        </div>
      )}

      {section === "exercises" && (
        <ExerciseCardGrid
          exercises={exercises}
          loading={exercisesQuery.isLoading}
          deletePending={deleteExerciseMutation.isPending}
          onEdit={(exercise) => {
            saveExerciseMutation.reset();
            setEditingExercise(exercise);
          }}
          onDelete={(id) => deleteExerciseMutation.mutate(id)}
        />
      )}

      {section === "quizzes" && (
        <QuizCardGrid
          quizzes={quizzes}
          loading={quizzesQuery.isLoading}
          deletePending={deleteQuizMutation.isPending}
          onEdit={(quiz) => {
            saveQuizMutation.reset();
            setEditingQuiz(quiz);
          }}
          onDelete={(id) => deleteQuizMutation.mutate(id)}
        />
      )}

      {section === "media" && (
        <div className="grid gap-4">
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                uploadMediaMutation.reset();
                setMediaUploadOpen(true);
              }}
            >
              <Upload className="size-4" />
              Загрузить медиа
            </Button>
          </div>
          <MediaList
            media={media}
            loading={mediaQuery.isLoading}
            deletePending={deleteMediaMutation.isPending}
            onDelete={(filename) => deleteMediaMutation.mutate(filename)}
          />
        </div>
      )}

      {section === "attempts" && (
        <Card>
          <CardContent className="grid gap-3 py-4">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                История прохождения пока пуста.
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <strong>Quiz #{session.quiz_id}</strong>
                    <p className="text-sm text-muted-foreground">
                      {sessionScore(session)} · started{" "}
                      {formatDateTime(session.started_at)}
                    </p>
                    {session.finished_at ? (
                      <p className="text-xs text-muted-foreground">
                        finished {formatDateTime(session.finished_at)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={quizSessionStatusAccent(session.status)}
                      variant="outline"
                    >
                      {quizSessionStatusLabel(session.status)}
                    </Badge>
                    {session.status === "finished" ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/results/quiz-sessions/${session.id}`}>
                          Результат
                        </Link>
                      </Button>
                    ) : null}
                    {session.status === "active" ? (
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/quizzes/${session.quiz_id}/play?sessionId=${session.id}`}
                        >
                          Продолжить
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      <ExerciseModal
        open={Boolean(editingExercise)}
        exercise={editingExercise}
        media={media}
        pending={saveExerciseMutation.isPending}
        uploadPending={uploadMediaMutation.isPending}
        error={saveExerciseMutation.error}
        uploadError={uploadMediaMutation.error}
        onOpenChange={(open) => {
          if (!open) {
            setEditingExercise(undefined);
            saveExerciseMutation.reset();
            uploadMediaMutation.reset();
          }
        }}
        onSubmit={(payload) => saveExerciseMutation.mutate(payload)}
        onUploadMedia={(file, name): Promise<MediaRead> =>
          uploadMediaMutation.mutateAsync({ file, name })
        }
      />

      <MediaUploadDialog
        open={mediaUploadOpen}
        uploadPending={uploadMediaMutation.isPending}
        error={uploadMediaMutation.error}
        onOpenChange={(open) => {
          setMediaUploadOpen(open);
          if (!open) {
            uploadMediaMutation.reset();
          }
        }}
        onUpload={async (file, name) => {
          await uploadMediaMutation.mutateAsync({ file, name });
          setMediaUploadOpen(false);
        }}
      />

      <QuizModal
        open={Boolean(editingQuiz)}
        quiz={editingQuiz}
        exercises={exercises}
        pending={saveQuizMutation.isPending}
        error={saveQuizMutation.error}
        onOpenChange={(open) => {
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

function sectionTitle(section: string) {
  const titles: Record<string, string> = {
    overview: "Профиль",
    exercises: "Мои упражнения",
    quizzes: "Мои квизы",
    media: "Мои медиафайлы",
    attempts: "Мои попытки",
  };

  return titles[section] ?? titles.overview;
}

function ProfileLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Button asChild variant="outline">
      <Link href={href}>
        <Icon className="size-4" />
        {label}
      </Link>
    </Button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
