"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExerciseRead,
  QuizPayload,
  QuizRead,
} from "@/features/creator/types";
import {
  exerciseTypeLabel,
  formatApiError,
  summarizeExercise,
} from "@/features/creator/utils";

type FormState = {
  title: string;
  description: string;
  public: boolean;
  exercise_ids: number[];
};

function initialState(quiz?: QuizRead): FormState {
  return {
    title: quiz?.title ?? "",
    description: quiz?.description ?? "",
    public: quiz?.public ?? false,
    exercise_ids: quiz?.exercise_ids ?? [],
  };
}

function buildPayload(state: FormState): QuizPayload {
  return {
    title: state.title.trim(),
    description: state.description.trim() || null,
    public: state.public,
    exercise_ids: state.exercise_ids,
  };
}

function validate(state: FormState) {
  if (!state.title.trim()) {
    return "Введите название квиза";
  }

  if (state.exercise_ids.length === 0) {
    return "Добавьте хотя бы одно упражнение";
  }

  return null;
}

export function QuizModal({
  open,
  quiz,
  exercises,
  pending,
  error,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  quiz?: QuizRead;
  exercises: ExerciseRead[];
  pending: boolean;
  error: unknown;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: QuizPayload) => void;
}) {
  const [state, setState] = useState<FormState>(() => initialState(quiz));
  const [localError, setLocalError] = useState<string | null>(null);
  const exerciseMap = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );
  const selectedExercises = state.exercise_ids
    .map((id) => exerciseMap.get(id))
    .filter((exercise): exercise is ExerciseRead => Boolean(exercise));
  const visibleError = localError ?? (error ? formatApiError(error) : null);

  useEffect(() => {
    if (open) {
      setState(initialState(quiz));
      setLocalError(null);
    }
  }, [open, quiz]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function addExercise(id: number) {
    if (state.exercise_ids.includes(id)) {
      return;
    }

    update("exercise_ids", [...state.exercise_ids, id]);
  }

  function removeExercise(id: number) {
    update(
      "exercise_ids",
      state.exercise_ids.filter((item) => item !== id),
    );
  }

  function moveExercise(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= state.exercise_ids.length) {
      return;
    }

    const next = [...state.exercise_ids];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    update("exercise_ids", next);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate(state);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    onSubmit(buildPayload(state));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {quiz ? "Редактировать квиз" : "Создать квиз"}
          </DialogTitle>
          <DialogDescription>
            Квиз хранит выбранные exercise_id в указанном порядке.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="grid content-start gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quiz-title">Название</Label>
                <Input
                  id="quiz-title"
                  value={state.title}
                  maxLength={200}
                  onChange={(event) => update("title", event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quiz-description">Описание</Label>
                <Textarea
                  id="quiz-description"
                  value={state.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <span className="grid gap-1">
                  <span className="text-sm font-medium">Публичный квиз</span>
                  <span className="text-xs text-muted-foreground">
                    Публичный квиз будет доступен другим ученикам.
                  </span>
                </span>
                <Switch
                  checked={state.public}
                  onCheckedChange={(value) => update("public", value)}
                />
              </div>

              <div className="grid gap-2">
                <h3 className="text-sm font-medium">Мои упражнения</h3>
                <div className="grid max-h-80 gap-2 overflow-y-auto rounded-lg border p-2">
                  {exercises.length === 0 ? (
                    <p className="p-2 text-sm text-muted-foreground">
                      Сначала создайте упражнение.
                    </p>
                  ) : (
                    exercises.map((exercise) => {
                      const selected = state.exercise_ids.includes(exercise.id);

                      return (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between gap-3 rounded-md border bg-card p-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {exerciseTypeLabel(exercise.type)}
                              </Badge>
                              <span className="truncate font-medium">
                                {exercise.exercise_text}
                              </span>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              #{exercise.id} · {summarizeExercise(exercise)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant={selected ? "secondary" : "outline"}
                            disabled={selected}
                            onClick={() => addExercise(exercise.id)}
                            aria-label="Добавить упражнение"
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <aside className="grid content-start gap-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{state.title || "Новый квиз"}</h3>
                <Badge variant={state.public ? "default" : "outline"}>
                  {state.public ? "Публично" : "Приватно"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {state.description || "Описание квиза появится здесь."}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Всего" value={selectedExercises.length} />
                <Stat
                  label="Перевод"
                  value={
                    selectedExercises.filter(
                      (exercise) => exercise.type === "translate",
                    ).length
                  }
                />
                <Stat
                  label="Диктант"
                  value={
                    selectedExercises.filter(
                      (exercise) => exercise.type === "dictation",
                    ).length
                  }
                />
              </div>
              <div className="grid gap-2">
                {selectedExercises.length === 0 ? (
                  <p className="rounded-md border bg-card p-3 text-sm text-muted-foreground">
                    Добавьте хотя бы одно упражнение.
                  </p>
                ) : (
                  selectedExercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="grid gap-2 rounded-md border bg-card p-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {index + 1}. {exercise.exercise_text}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            exercise_id: {exercise.id}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => removeExercise(exercise.id)}
                          aria-label="Убрать упражнение"
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="outline"
                          disabled={index === 0}
                          onClick={() => moveExercise(index, -1)}
                          aria-label="Переместить выше"
                        >
                          <ArrowUp className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="outline"
                          disabled={index === selectedExercises.length - 1}
                          onClick={() => moveExercise(index, 1)}
                          aria-label="Переместить ниже"
                        >
                          <ArrowDown className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>

          {visibleError && (
            <Alert variant="destructive">
              <AlertDescription>{visibleError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-card p-2">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
