"use client";

import { useQuery } from "@tanstack/react-query";
import { Headphones, LibraryBig, ListChecks, User, Wand2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRead } from "@/features/auth/types";
import {
  getMyExercises,
  getMyMedia,
  getMyQuizzes,
} from "@/features/creator/api";
import { creatorKeys } from "@/features/creator/query-keys";
import { exerciseTypeLabel } from "@/features/creator/utils";
import { getMyQuizSessions } from "@/features/student/api";
import { studentKeys } from "@/features/student/query-keys";
import { formatDateTime, sessionScore } from "@/features/student/utils";

export function ProfilePage({
  user,
  section = "overview",
}: {
  user: UserRead;
  section?: "overview" | "exercises" | "quizzes" | "media" | "attempts";
}) {
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
        <Card>
          <CardContent className="grid gap-3 py-4">
            {exercises.length === 0 ? (
              <EmptyState
                text="Упражнений пока нет."
                action="Создать упражнение"
              />
            ) : (
              exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <strong>{exercise.exercise_text}</strong>
                    <p className="text-sm text-muted-foreground">
                      #{exercise.id} · {exerciseTypeLabel(exercise.type)}
                    </p>
                  </div>
                  <Badge variant={exercise.public ? "default" : "outline"}>
                    {exercise.public ? "Публично" : "Приватно"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {section === "quizzes" && (
        <Card>
          <CardContent className="grid gap-3 py-4">
            {quizzes.length === 0 ? (
              <EmptyState text="Квизов пока нет." action="Создать квиз" />
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <strong>{quiz.title}</strong>
                    <p className="text-sm text-muted-foreground">
                      {quiz.exercise_ids.length} упражнений
                    </p>
                  </div>
                  <Badge variant={quiz.public ? "default" : "outline"}>
                    {quiz.public ? "Публично" : "Приватно"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {section === "media" && (
        <Card>
          <CardContent className="grid gap-3 py-4">
            {media.length === 0 ? (
              <EmptyState
                text="Медиафайлов пока нет."
                action="Загрузить медиа"
              />
            ) : (
              media.map((item) => (
                <div
                  key={item.media_filename}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <strong className="truncate">{item.media_filename}</strong>
                    <p className="text-sm text-muted-foreground">
                      {item.extension}
                    </p>
                  </div>
                  <Badge variant="outline">media</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
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
                    <Badge variant="outline">{session.status}</Badge>
                    {session.status === "finished" ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/results/quiz-sessions/${session.id}`}>
                          Result
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

function EmptyState({ text, action }: { text: string; action: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Button asChild>
        <Link href="/create">{action}</Link>
      </Button>
    </div>
  );
}
