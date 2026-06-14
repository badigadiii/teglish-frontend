"use client";

import {
  Dumbbell,
  Edit3,
  FileAudio,
  LibraryBig,
  MoreVertical,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmation } from "@/features/creator/components/delete-confirmation";
import type {
  ExerciseRead,
  MediaRead,
  QuizRead,
} from "@/features/creator/types";
import { exerciseTypeLabel, summarizeExercise } from "@/features/creator/utils";

export function ExerciseCardGrid({
  exercises,
  loading,
  deletePending,
  onEdit,
  onDelete,
}: {
  exercises: ExerciseRead[];
  loading: boolean;
  deletePending: boolean;
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
      <EmptyResource
        text="Упражнений пока нет. Создайте перевод, грамматику или диктант."
        action="Создать упражнение"
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {exercises.map((exercise) => (
        <article key={exercise.id} aria-label={exercise.exercise_text}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                  <Dumbbell className="size-5" />
                </div>
                <CardTitle className="line-clamp-2">
                  {exercise.exercise_text}
                </CardTitle>
              </div>
              <CardAction className="flex items-center gap-2">
                <Badge variant={exercise.public ? "default" : "outline"}>
                  {exercise.public ? "Публично" : "Приватно"}
                </Badge>
                <ExerciseActions
                  exercise={exercise}
                  deletePending={deletePending}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
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
              <Button asChild className="w-fit">
                <Link href={`/exercises/${exercise.id}/play`}>
                  <Play className="size-4" />
                  Начать
                </Link>
              </Button>
            </CardContent>
          </Card>
        </article>
      ))}
    </div>
  );
}

export function QuizCardGrid({
  quizzes,
  loading,
  deletePending,
  onEdit,
  onDelete,
}: {
  quizzes: QuizRead[];
  loading: boolean;
  deletePending: boolean;
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
      <EmptyResource
        text="Квизов пока нет. Соберите первый квиз из своих упражнений."
        action="Создать квиз"
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {quizzes.map((quiz) => (
        <article key={quiz.id} aria-label={quiz.title}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary">
                  <LibraryBig className="size-5" />
                </div>
                <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
              </div>
              <CardAction className="flex items-center gap-2">
                <Badge variant={quiz.public ? "default" : "outline"}>
                  {quiz.public ? "Публично" : "Приватно"}
                </Badge>
                <QuizActions
                  quiz={quiz}
                  deletePending={deletePending}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
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
              <Button asChild className="w-fit">
                <Link href={`/quizzes/${quiz.id}`}>
                  <Play className="size-4" />
                  Начать
                </Link>
              </Button>
            </CardContent>
          </Card>
        </article>
      ))}
    </div>
  );
}

export function MediaList({
  media,
  loading,
  deletePending,
  onDelete,
}: {
  media: MediaRead[];
  loading: boolean;
  deletePending: boolean;
  onDelete: (filename: string) => void;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">Загрузка медиафайлов...</CardContent>
      </Card>
    );
  }

  if (media.length === 0) {
    return (
      <EmptyResource
        text="Медиафайлов пока нет. Загрузите аудио или видео для диктанта."
        action="Загрузить медиа"
      />
    );
  }

  return (
    <div className="grid gap-3">
      {media.map((item) => (
        <article key={item.media_filename} aria-label={item.media_filename}>
          <Card>
            <CardContent className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-start">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <FileAudio className="size-4 shrink-0 text-muted-foreground" />
                  <strong className="truncate">{item.media_filename}</strong>
                  <Badge variant="outline">{item.extension}</Badge>
                </div>
                <div className="mt-3">
                  {["mp4", "webm", "mov"].includes(
                    item.extension.toLowerCase(),
                  ) ? (
                    <video
                      className="max-h-32 w-full rounded-md border"
                      controls
                      src={item.media_url}
                    >
                      <track kind="captions" />
                    </video>
                  ) : (
                    <audio className="w-full" controls src={item.media_url}>
                      <track kind="captions" />
                    </audio>
                  )}
                </div>
              </div>
              <MediaActions
                item={item}
                deletePending={deletePending}
                onDelete={onDelete}
              />
            </CardContent>
          </Card>
        </article>
      ))}
    </div>
  );
}

function ExerciseActions({
  exercise,
  deletePending,
  onEdit,
  onDelete,
}: {
  exercise: ExerciseRead;
  deletePending: boolean;
  onEdit: (exercise: ExerciseRead) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Действия упражнения"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(exercise)}>
          <Edit3 className="size-4" />
          Изменить
        </DropdownMenuItem>
        <DeleteConfirmation
          title="Удалить упражнение?"
          description="Упражнение исчезнет из вашего списка. Если оно входит в квизы, backend может отказать в удалении."
          onConfirm={() => onDelete(exercise.id)}
        >
          <DropdownMenuItem
            variant="destructive"
            disabled={deletePending}
            onSelect={(event) => event.preventDefault()}
          >
            <Trash2 className="size-4" />
            Удалить
          </DropdownMenuItem>
        </DeleteConfirmation>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function QuizActions({
  quiz,
  deletePending,
  onEdit,
  onDelete,
}: {
  quiz: QuizRead;
  deletePending: boolean;
  onEdit: (quiz: QuizRead) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Действия квиза"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(quiz)}>
          <Edit3 className="size-4" />
          Изменить
        </DropdownMenuItem>
        <DeleteConfirmation
          title="Удалить квиз?"
          description="Квиз исчезнет из вашего списка и публичного каталога."
          onConfirm={() => onDelete(quiz.id)}
        >
          <DropdownMenuItem
            variant="destructive"
            disabled={deletePending}
            onSelect={(event) => event.preventDefault()}
          >
            <Trash2 className="size-4" />
            Удалить
          </DropdownMenuItem>
        </DeleteConfirmation>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MediaActions({
  item,
  deletePending,
  onDelete,
}: {
  item: MediaRead;
  deletePending: boolean;
  onDelete: (filename: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Действия медиафайла"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DeleteConfirmation
          title="Удалить медиафайл?"
          description="Файл исчезнет из списка и больше не будет доступен для новых диктантов."
          onConfirm={() => onDelete(item.media_filename)}
        >
          <DropdownMenuItem
            variant="destructive"
            disabled={deletePending}
            onSelect={(event) => event.preventDefault()}
          >
            <Trash2 className="size-4" />
            Удалить
          </DropdownMenuItem>
        </DeleteConfirmation>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyResource({ text, action }: { text: string; action: string }) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-8">
        <p className="text-sm text-muted-foreground">{text}</p>
        <Button asChild>
          <Link href="/create">
            <Plus className="size-4" />
            {action}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
