"use client";

import { Headphones, Languages, Puzzle, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExercisePayload,
  ExerciseRead,
  ExerciseType,
  MediaRead,
} from "@/features/creator/types";
import {
  exerciseTypeLabel,
  formatApiError,
  linesToList,
  listToLines,
} from "@/features/creator/utils";

const typeIcons = {
  translate: Languages,
  grammar: Puzzle,
  dictation: Headphones,
};

type FormState = {
  exercise_text: string;
  public: boolean;
  type: ExerciseType;
  correct_answers: string;
  correct_answer: string;
  response_options: string;
  speech_text: string;
  media_filename: string;
};

function initialState(exercise?: ExerciseRead): FormState {
  if (!exercise) {
    return {
      exercise_text: "",
      public: false,
      type: "translate",
      correct_answers: "",
      correct_answer: "",
      response_options: "",
      speech_text: "",
      media_filename: "",
    };
  }

  return {
    exercise_text: exercise.exercise_text,
    public: exercise.public,
    type: exercise.type,
    correct_answers:
      exercise.type === "translate"
        ? listToLines(exercise.payload.correct_answers)
        : "",
    correct_answer:
      exercise.type === "grammar" ? exercise.payload.correct_answer : "",
    response_options:
      exercise.type !== "dictation"
        ? listToLines(exercise.payload.response_options)
        : "",
    speech_text:
      exercise.type === "dictation" ? exercise.payload.speech_text : "",
    media_filename:
      exercise.type === "dictation" ? exercise.payload.media_filename : "",
  };
}

function buildPayload(state: FormState): ExercisePayload {
  const base = {
    exercise_text: state.exercise_text.trim(),
    public: state.public,
  };

  if (state.type === "grammar") {
    return {
      ...base,
      type: "grammar",
      payload: {
        correct_answer: state.correct_answer.trim(),
        response_options: linesToList(state.response_options),
      },
    };
  }

  if (state.type === "dictation") {
    return {
      ...base,
      type: "dictation",
      payload: {
        speech_text: state.speech_text.trim(),
        media_filename: state.media_filename,
      },
    };
  }

  return {
    ...base,
    type: "translate",
    payload: {
      correct_answers: linesToList(state.correct_answers),
      response_options: linesToList(state.response_options),
    },
  };
}

function validate(state: FormState) {
  if (!state.exercise_text.trim()) {
    return "Введите текст упражнения";
  }

  if (state.type === "grammar" && !state.correct_answer.trim()) {
    return "Укажите правильный ответ";
  }

  if (state.type === "dictation") {
    if (!state.speech_text.trim()) {
      return "Введите текст диктанта";
    }

    if (!state.media_filename) {
      return "Выберите или загрузите медиафайл";
    }
  }

  return null;
}

export function ExerciseModal({
  open,
  exercise,
  media,
  pending,
  uploadPending,
  error,
  uploadError,
  onOpenChange,
  onSubmit,
  onUploadMedia,
}: {
  open: boolean;
  exercise?: ExerciseRead;
  media: MediaRead[];
  pending: boolean;
  uploadPending: boolean;
  error: unknown;
  uploadError: unknown;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ExercisePayload) => void;
  onUploadMedia: (file: File, name?: string) => Promise<MediaRead>;
}) {
  const [state, setState] = useState<FormState>(() => initialState(exercise));
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [localUploadError, setLocalUploadError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const lockedType = Boolean(exercise);

  useEffect(() => {
    if (open) {
      setState(initialState(exercise));
      setLocalError(null);
      setUploadFile(null);
      setUploadName("");
      setLocalUploadError(null);
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }
    }
  }, [exercise, open]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
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

  async function uploadDictationMedia() {
    if (!uploadFile) {
      setLocalUploadError("Выберите аудио или видео файл");
      return;
    }

    if (
      uploadFile.type &&
      !(
        uploadFile.type.startsWith("audio/") ||
        uploadFile.type.startsWith("video/")
      )
    ) {
      setLocalUploadError("Поддерживаются только audio/* и video/*");
      return;
    }

    setLocalUploadError(null);
    try {
      const uploaded = await onUploadMedia(uploadFile, uploadName);
      update("media_filename", uploaded.media_filename);
      setUploadFile(null);
      setUploadName("");
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }
    } catch {
      // The upload mutation exposes the user-facing error through uploadError.
    }
  }

  const visibleError = localError ?? (error ? formatApiError(error) : null);
  const visibleUploadError =
    localUploadError ?? (uploadError ? formatApiError(uploadError) : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {exercise ? "Редактировать упражнение" : "Создать упражнение"}
          </DialogTitle>
          <DialogDescription>
            Тип задания, текст, ответы и публичность сохраняются в backend.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-5">
            <div className="grid gap-4">
              <Tabs
                value={state.type}
                onValueChange={(value) =>
                  !lockedType && update("type", value as ExerciseType)
                }
              >
                <TabsList className="w-full">
                  {(["translate", "grammar", "dictation"] as const).map(
                    (type) => {
                      const TypeIcon = typeIcons[type];

                      return (
                        <TabsTrigger
                          key={type}
                          value={type}
                          disabled={lockedType && state.type !== type}
                          className="gap-2"
                        >
                          <TypeIcon className="size-4" />
                          {exerciseTypeLabel(type)}
                        </TabsTrigger>
                      );
                    },
                  )}
                </TabsList>
              </Tabs>

              <div className="grid gap-2">
                <Label htmlFor="exercise-text">Задание</Label>
                <Textarea
                  id="exercise-text"
                  value={state.exercise_text}
                  onChange={(event) =>
                    update("exercise_text", event.target.value)
                  }
                  placeholder="Translate the phrase"
                />
              </div>

              {state.type === "translate" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="correct-answers">
                      Правильные ответы, по одному на строку
                    </Label>
                    <Textarea
                      id="correct-answers"
                      value={state.correct_answers}
                      onChange={(event) =>
                        update("correct_answers", event.target.value)
                      }
                    />
                  </div>
                  <OptionsField
                    value={state.response_options}
                    onChange={(value) => update("response_options", value)}
                  />
                </>
              )}

              {state.type === "grammar" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="correct-answer">Правильный ответ</Label>
                    <Input
                      id="correct-answer"
                      value={state.correct_answer}
                      onChange={(event) =>
                        update("correct_answer", event.target.value)
                      }
                    />
                  </div>
                  <OptionsField
                    value={state.response_options}
                    onChange={(value) => update("response_options", value)}
                  />
                </>
              )}

              {state.type === "dictation" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="speech-text">Текст диктанта</Label>
                    <Textarea
                      id="speech-text"
                      value={state.speech_text}
                      onChange={(event) =>
                        update("speech_text", event.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="media-filename">Медиафайл</Label>
                    <select
                      id="media-filename"
                      value={state.media_filename}
                      onChange={(event) =>
                        update("media_filename", event.target.value)
                      }
                      className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
                    >
                      <option value="">Выберите файл</option>
                      {media.map((item) => (
                        <option
                          key={item.media_filename}
                          value={item.media_filename}
                        >
                          {item.media_filename}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Upload className="size-4" />
                      Загрузить медиафайл
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <div className="grid gap-2">
                        <Label htmlFor="dictation-media-file">
                          Загрузить медиафайл
                        </Label>
                        <Input
                          ref={uploadInputRef}
                          id="dictation-media-file"
                          type="file"
                          accept="audio/*,video/*"
                          onChange={(event) => {
                            setUploadFile(event.target.files?.[0] ?? null);
                            setLocalUploadError(null);
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dictation-media-name">
                          Имя загружаемого медиа
                        </Label>
                        <Input
                          id="dictation-media-name"
                          value={uploadName}
                          onChange={(event) =>
                            setUploadName(event.target.value)
                          }
                          placeholder="movie scene"
                        />
                      </div>
                      <Button
                        className="self-end"
                        type="button"
                        disabled={uploadPending}
                        onClick={uploadDictationMedia}
                      >
                        {uploadPending ? "Загрузка..." : "Загрузить медиа"}
                      </Button>
                    </div>
                    {visibleUploadError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {visibleUploadError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <span className="grid gap-1">
                  <span className="text-sm font-medium">
                    Публичное упражнение
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Публичные задания попадут в общий каталог после сохранения.
                  </span>
                </span>
                <Switch
                  checked={state.public}
                  onCheckedChange={(value) => update("public", value)}
                />
              </div>
            </div>
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

function OptionsField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="response-options">
        Варианты ответа, по одному на строку
      </Label>
      <Textarea
        id="response-options"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
