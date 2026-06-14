"use client";

import { useQuery } from "@tanstack/react-query";
import { LibraryBig } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicQuizzes } from "@/features/student/api";
import { CatalogPagination } from "@/features/student/catalog/components/catalog-pagination";
import { QuizCard } from "@/features/student/catalog/components/quiz-card";
import { studentKeys } from "@/features/student/query-keys";

export function QuizCatalog({ page, size }: { page: number; size: number }) {
  const quizzesQuery = useQuery({
    queryKey: studentKeys.quizzes(page, size),
    queryFn: () => getPublicQuizzes(page, size),
  });

  const quizzes = quizzesQuery.data?.items ?? [];

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <div className="grid size-11 place-items-center rounded-lg bg-primary/15 text-primary">
          <LibraryBig className="size-5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-normal">
          Публичные квизы
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Выберите публичный квиз и отвечайте на вопросы с мгновенной обратной
          связью.
        </p>
      </section>

      {quizzesQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-56 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
        </div>
      ) : null}

      {quizzesQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {quizzesQuery.error instanceof Error
              ? quizzesQuery.error.message
              : "Не удалось загрузить квизы"}
          </AlertDescription>
        </Alert>
      ) : null}

      {!quizzesQuery.isLoading && quizzes.length === 0 ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Публичных квизов пока нет.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>

      {quizzesQuery.data ? (
        <CatalogPagination
          basePath="/quizzes"
          page={quizzesQuery.data.page}
          pages={quizzesQuery.data.pages}
          size={quizzesQuery.data.size}
        />
      ) : null}
    </div>
  );
}
