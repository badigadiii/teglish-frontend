"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";

import { PageHeader } from "@/components/layout/page-header";
import { ApiErrorAlert } from "@/components/shared/api-error-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaFilenameBadge } from "@/features/media/components/media-filename-badge";
import { MediaPreview } from "@/features/media/components/media-preview";
import { MediaUploadField } from "@/features/media/components/media-upload-field";
import { createExercise } from "@/lib/api/exercises";
import { queryKeys } from "@/lib/api/query-keys";
import type { ExerciseCreate, ExerciseRead } from "@/lib/api/types";
import type { ApiError } from "@/lib/errors/api-error";

const exerciseTypes = [
  {
    value: "grammar",
    label: "Grammar",
    description: "Single correct answer with optional response options.",
  },
  {
    value: "translate",
    label: "Translate",
    description: "One or more correct translations plus optional choices.",
  },
  {
    value: "dictation",
    label: "Dictation",
    description: "Upload media and validate the spoken phrase.",
  },
] as const;

const listItemSchema = z.object({
  value: z.string(),
});

const exerciseFormSchema = z
  .object({
    type: z.enum(["grammar", "translate", "dictation"]),
    exerciseText: z.string().trim().min(1, "Введите текст упражнения."),
    grammar: z.object({
      correctAnswer: z.string(),
      responseOptions: z.array(listItemSchema),
    }),
    translate: z.object({
      correctAnswers: z.array(listItemSchema),
      responseOptions: z.array(listItemSchema),
    }),
    dictation: z.object({
      speechText: z.string(),
      mediaFilename: z.string(),
      mediaUrl: z.string().optional(),
    }),
  })
  .superRefine((values, context) => {
    if (values.type === "grammar") {
      if (values.grammar.correctAnswer.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите правильный ответ.",
          path: ["grammar", "correctAnswer"],
        });
      }
    }

    if (values.type === "translate") {
      const answers = values.translate.correctAnswers
        .map((item) => item.value.trim())
        .filter(Boolean);

      if (answers.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Добавьте хотя бы один правильный перевод.",
          path: ["translate", "correctAnswers"],
        });
      }
    }

    if (values.type === "dictation") {
      if (values.dictation.speechText.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите фразу для сверки.",
          path: ["dictation", "speechText"],
        });
      }

      if (values.dictation.mediaFilename.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Сначала загрузите аудио или видео.",
          path: ["dictation", "mediaFilename"],
        });
      }
    }
  });

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

const defaultValues: ExerciseFormValues = {
  type: "grammar",
  exerciseText: "",
  grammar: {
    correctAnswer: "",
    responseOptions: [{ value: "" }],
  },
  translate: {
    correctAnswers: [{ value: "" }],
    responseOptions: [{ value: "" }],
  },
  dictation: {
    speechText: "",
    mediaFilename: "",
    mediaUrl: "",
  },
};

function normalizeList(items: { value: string }[]) {
  return items.map((item) => item.value.trim()).filter(Boolean);
}

function buildCreatePayload(values: ExerciseFormValues): ExerciseCreate {
  const exerciseText = values.exerciseText.trim();

  if (values.type === "grammar") {
    return {
      type: "grammar",
      exercise_text: exerciseText,
      payload: {
        correct_answer: values.grammar.correctAnswer.trim(),
        response_options: normalizeList(values.grammar.responseOptions),
      },
    };
  }

  if (values.type === "translate") {
    return {
      type: "translate",
      exercise_text: exerciseText,
      payload: {
        correct_answers: normalizeList(values.translate.correctAnswers),
        response_options: normalizeList(values.translate.responseOptions),
      },
    };
  }

  return {
    type: "dictation",
    exercise_text: exerciseText,
    payload: {
      speech_text: values.dictation.speechText.trim(),
      media_filename: values.dictation.mediaFilename.trim(),
    },
  };
}

function mapServerErrors(
  error: ApiError,
  setError: ReturnType<typeof useForm<ExerciseFormValues>>["setError"],
) {
  const mediaError =
    error.fieldErrors?.["payload.media_filename"] ??
    error.fieldErrors?.media_filename;

  if (mediaError) {
    setError("dictation.mediaFilename", {
      message: mediaError,
    });
  }

  if (error.message.toLowerCase().includes("media")) {
    setError("dictation.mediaFilename", {
      message: error.message,
    });
  }

  if (error.fieldErrors?.exercise_text) {
    setError("exerciseText", {
      message: error.fieldErrors.exercise_text,
    });
  }
}

function applySchemaErrors(
  error: z.ZodError<ExerciseFormValues>,
  setError: ReturnType<typeof useForm<ExerciseFormValues>>["setError"],
) {
  for (const issue of error.issues) {
    const path = issue.path.join(".");

    if (path === "exerciseText") {
      setError("exerciseText", { message: issue.message });
      continue;
    }

    if (path === "grammar.correctAnswer") {
      setError("grammar.correctAnswer", { message: issue.message });
      continue;
    }

    if (path === "translate.correctAnswers") {
      setError("translate.correctAnswers", { message: issue.message });
      continue;
    }

    if (path === "dictation.speechText") {
      setError("dictation.speechText", { message: issue.message });
      continue;
    }

    if (path === "dictation.mediaFilename") {
      setError("dictation.mediaFilename", { message: issue.message });
    }
  }
}

type StringListFieldsProps = {
  control: ReturnType<typeof useForm<ExerciseFormValues>>["control"];
  label: string;
  description: string;
  emptyLabel: string;
  addLabel: string;
  fields: Array<{ id: string }>;
  namePrefix:
    | "grammar.responseOptions"
    | "translate.correctAnswers"
    | "translate.responseOptions";
  onAdd: () => void;
  onRemove: (index: number) => void;
};

function StringListFields({
  control,
  label,
  description,
  emptyLabel,
  addLabel,
  fields,
  namePrefix,
  onAdd,
  onRemove,
}: StringListFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          <PlusIcon />
          {addLabel}
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : null}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <FormField
            control={control}
            key={field.id}
            name={`${namePrefix}.${index}.value` as const}
            render={({ field: inputField }) => (
              <FormItem>
                <div className="flex gap-3">
                  <FormControl>
                    <Input
                      placeholder={`${label} ${index + 1}`}
                      {...inputField}
                    />
                  </FormControl>
                  <Button
                    aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
                    onClick={() => onRemove(index)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function ExerciseForm() {
  const queryClient = useQueryClient();
  const form = useForm<ExerciseFormValues>({
    defaultValues,
  });
  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });
  const grammarOptions = useWatch({
    control: form.control,
    name: "grammar.responseOptions",
  });
  const grammarCorrectAnswer = useWatch({
    control: form.control,
    name: "grammar.correctAnswer",
  });
  const dictationMediaFilename = useWatch({
    control: form.control,
    name: "dictation.mediaFilename",
  });
  const dictationMediaUrl = useWatch({
    control: form.control,
    name: "dictation.mediaUrl",
  });
  const grammarResponseOptions = useFieldArray({
    control: form.control,
    name: "grammar.responseOptions",
  });
  const translateCorrectAnswers = useFieldArray({
    control: form.control,
    name: "translate.correctAnswers",
  });
  const translateResponseOptions = useFieldArray({
    control: form.control,
    name: "translate.responseOptions",
  });
  const optionRecommendation = useMemo(() => {
    const normalizedCorrectAnswer = grammarCorrectAnswer.trim().toLowerCase();
    const normalizedOptions = normalizeList(grammarOptions ?? []).map((item) =>
      item.toLowerCase(),
    );

    if (!normalizedCorrectAnswer || normalizedOptions.length === 0) {
      return null;
    }

    return normalizedOptions.includes(normalizedCorrectAnswer)
      ? null
      : "Рекомендуется включить правильный ответ в список response options.";
  }, [grammarCorrectAnswer, grammarOptions]);

  const createExerciseMutation = useMutation({
    mutationFn: (values: ExerciseFormValues) =>
      createExercise(buildCreatePayload(values)),
    onSuccess: async (createdExercise: ExerciseRead) => {
      toast.success(`Упражнение #${createdExercise.id} создано`);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.exercises.all,
      });
      form.reset(defaultValues);
      form.setValue("type", createdExercise.type);
      setLastCreatedExercise(createdExercise);
    },
    onError: (error) => {
      if (error instanceof Error && "status" in error) {
        mapServerErrors(error as ApiError, form.setError);
      }
    },
  });
  const [lastCreatedExercise, setLastCreatedExercise] =
    useState<ExerciseRead | null>(null);

  function handleAddGrammarOption() {
    grammarResponseOptions.append({ value: "" });
  }

  function handleAddTranslateAnswer() {
    translateCorrectAnswers.append({ value: "" });
  }

  function handleAddTranslateOption() {
    translateResponseOptions.append({ value: "" });
  }

  function handleCreateExercise(values: ExerciseFormValues) {
    form.clearErrors();
    createExerciseMutation.reset();

    const parsedValues = exerciseFormSchema.safeParse(values);

    if (!parsedValues.success) {
      applySchemaErrors(parsedValues.error, form.setError);
      return;
    }

    createExerciseMutation.mutate(parsedValues.data);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Authoring"
        title="Create exercise"
        description="Build grammar, translate, or dictation exercises against the current FastAPI contract. Dictation authoring includes media upload directly in the form."
        actions={
          <>
            <Badge variant="secondary">Stage 6</Badge>
            <Badge variant="outline">Stage 7</Badge>
          </>
        }
      />

      {lastCreatedExercise ? (
        <Alert>
          <CheckCircle2Icon className="size-4" />
          <AlertTitle>Exercise created</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Exercise #{lastCreatedExercise.id} is ready. You can open the
              public player immediately or continue authoring another exercise.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href={`/exercises/${lastCreatedExercise.id}`}>
                  Open public player
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Exercise payload</CardTitle>
          <CardDescription>
            The form sends a discriminated union payload to `POST /exercises`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-8"
              onSubmit={form.handleSubmit(handleCreateExercise)}
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise type</FormLabel>
                    <div className="grid gap-3 md:grid-cols-3">
                      {exerciseTypes.map((typeOption) => {
                        const isActive = field.value === typeOption.value;

                        return (
                          <button
                            className={`rounded-xl border p-4 text-left transition-colors ${
                              isActive
                                ? "border-primary bg-primary/8 text-foreground"
                                : "border-border bg-card text-muted-foreground hover:border-primary/40"
                            }`}
                            key={typeOption.value}
                            onClick={() => {
                              field.onChange(typeOption.value);
                              form.clearErrors();
                            }}
                            type="button"
                          >
                            <span className="block font-medium text-foreground">
                              {typeOption.label}
                            </span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                              {typeOption.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exerciseText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise text</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-28"
                        placeholder="Choose the correct verb"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This becomes `exercise_text` for every exercise type.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedType === "grammar" ? (
                <div className="space-y-6 rounded-xl border p-5">
                  <FormField
                    control={form.control}
                    name="grammar.correctAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct answer</FormLabel>
                        <FormControl>
                          <Input placeholder="is" {...field} />
                        </FormControl>
                        <FormDescription>
                          Required. The backend compares this answer directly.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StringListFields
                    addLabel="Add option"
                    control={form.control}
                    description="Optional. Empty rows are removed before submit."
                    emptyLabel="No response options yet."
                    fields={grammarResponseOptions.fields}
                    label="Response option"
                    namePrefix="grammar.responseOptions"
                    onAdd={handleAddGrammarOption}
                    onRemove={(index) => grammarResponseOptions.remove(index)}
                  />

                  {optionRecommendation ? (
                    <Alert>
                      <CircleAlertIcon className="size-4" />
                      <AlertTitle>Recommendation</AlertTitle>
                      <AlertDescription>
                        {optionRecommendation}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              ) : null}

              {selectedType === "translate" ? (
                <div className="space-y-6 rounded-xl border p-5">
                  <StringListFields
                    addLabel="Add answer"
                    control={form.control}
                    description="At least one non-empty value is required."
                    emptyLabel="No correct translations yet."
                    fields={translateCorrectAnswers.fields}
                    label="Correct answer"
                    namePrefix="translate.correctAnswers"
                    onAdd={handleAddTranslateAnswer}
                    onRemove={(index) => translateCorrectAnswers.remove(index)}
                  />
                  <FormField
                    control={form.control}
                    name="translate.correctAnswers"
                    render={() => (
                      <FormItem>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StringListFields
                    addLabel="Add option"
                    control={form.control}
                    description="Optional. These are suggested learner choices."
                    emptyLabel="No response options yet."
                    fields={translateResponseOptions.fields}
                    label="Response option"
                    namePrefix="translate.responseOptions"
                    onAdd={handleAddTranslateOption}
                    onRemove={(index) => translateResponseOptions.remove(index)}
                  />
                </div>
              ) : null}

              {selectedType === "dictation" ? (
                <div className="space-y-6 rounded-xl border p-5">
                  <FormField
                    control={form.control}
                    name="dictation.speechText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Speech text</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-24"
                            placeholder="I am learning English"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Learner input is validated against this phrase.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dictation.mediaFilename"
                    render={({ fieldState }) => (
                      <FormItem>
                        <FormLabel>Media upload</FormLabel>
                        <MediaUploadField
                          fieldError={fieldState.error?.message}
                          mediaUrl={dictationMediaUrl}
                          onClear={() => {
                            form.setValue("dictation.mediaFilename", "", {
                              shouldValidate: true,
                            });
                            form.setValue("dictation.mediaUrl", "");
                          }}
                          onUploaded={(media) => {
                            form.setValue(
                              "dictation.mediaFilename",
                              media.media_filename,
                              { shouldValidate: true },
                            );
                            form.setValue(
                              "dictation.mediaUrl",
                              media.media_url,
                            );
                            form.clearErrors("dictation.mediaFilename");
                          }}
                          value={dictationMediaFilename}
                        />
                        <FormDescription>
                          The form stores only the returned `media_filename` in
                          the final payload.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {dictationMediaFilename ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Current filename:
                      </span>
                      <MediaFilenameBadge
                        mediaFilename={dictationMediaFilename}
                      />
                    </div>
                  ) : null}

                  <MediaPreview
                    description="Preview uses the proxied media URL, matching the public dictation player."
                    mediaFilename={dictationMediaFilename}
                    mediaUrl={dictationMediaUrl}
                    title="Dictation preview"
                  />
                </div>
              ) : null}

              {createExerciseMutation.error ? (
                <ApiErrorAlert
                  error={createExerciseMutation.error}
                  title="Exercise creation failed"
                />
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={createExerciseMutation.isPending}
                  type="submit"
                >
                  {createExerciseMutation.isPending
                    ? "Creating exercise..."
                    : "Create exercise"}
                </Button>
                <Button
                  onClick={() => {
                    form.reset(defaultValues);
                    createExerciseMutation.reset();
                  }}
                  type="button"
                  variant="outline"
                >
                  Reset form
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
