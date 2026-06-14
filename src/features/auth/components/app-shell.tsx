"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ChevronDown,
  Dumbbell,
  Headphones,
  Home,
  LibraryBig,
  ListChecks,
  LogOut,
  PenTool,
  User,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/api";
import type { UserRead } from "@/features/auth/types";
import {
  createExercise,
  createQuiz,
  getMyExercises,
  getMyMedia,
} from "@/features/creator/api";
import { ExerciseModal } from "@/features/creator/components/exercise-modal";
import { QuizModal } from "@/features/creator/components/quiz-modal";
import { creatorKeys } from "@/features/creator/query-keys";
import type { ExercisePayload, QuizPayload } from "@/features/creator/types";

const navItems = [
  { href: "/learn", label: "Главная", icon: Home },
  { href: "/quizzes", label: "Квизы", icon: LibraryBig },
  { href: "/exercises", label: "Упражнения", icon: Dumbbell },
];

function initials(user: UserRead) {
  return (user.name || user.username).slice(0, 2).toUpperCase();
}

export function AppShell({
  user,
  children,
}: {
  user: UserRead;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  const mediaQuery = useQuery({
    queryKey: creatorKeys.media(1, 20),
    queryFn: () => getMyMedia(1, 20),
    enabled: exerciseModalOpen,
  });
  const exercisesQuery = useQuery({
    queryKey: creatorKeys.exercises(),
    queryFn: getMyExercises,
    enabled: quizModalOpen,
  });

  const saveExerciseMutation = useMutation({
    mutationFn: (payload: ExercisePayload) => createExercise(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: creatorKeys.exercises(),
      });
      setExerciseModalOpen(false);
    },
  });

  const saveQuizMutation = useMutation({
    mutationFn: (payload: QuizPayload) => createQuiz(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creatorKeys.quizzes() });
      setQuizModalOpen(false);
    },
  });

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-5">
      <header className="sticky top-4 z-20 rounded-lg border bg-card/90 px-3 py-3 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/learn" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="size-5" />
            </span>
            <span className="text-xl font-black tracking-normal">Teglish</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className="capitalize"
                >
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="secondary" className="h-10 gap-2">
                <PenTool className="size-4" />
                Создать
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onSelect={() => {
                  saveExerciseMutation.reset();
                  setExerciseModalOpen(true);
                }}
              >
                <Dumbbell className="size-4" />
                Создать упражнение
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  saveQuizMutation.reset();
                  setQuizModalOpen(true);
                }}
              >
                <LibraryBig className="size-4" />
                Создать квиз
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2"
                aria-label={`Профиль ${user.name}`}
              >
                <Avatar className="size-7 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-xs font-black text-primary-foreground">
                    {initials(user)}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-32 truncate">{user.name}</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="grid gap-1">
                <span>{user.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  @{user.username}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="size-4" />
                  Профиль
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/exercises">
                  <Wand2 className="size-4" />
                  Мои упражнения
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/quizzes">
                  <LibraryBig className="size-4" />
                  Мои квизы
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/media">
                  <Headphones className="size-4" />
                  Мои медиафайлы
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/attempts">
                  <ListChecks className="size-4" />
                  Мои попытки
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="size-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="py-8">{children}</main>

      <ExerciseModal
        open={exerciseModalOpen}
        media={mediaQuery.data?.items ?? []}
        pending={saveExerciseMutation.isPending}
        error={saveExerciseMutation.error ?? mediaQuery.error}
        onOpenChange={(open) => {
          setExerciseModalOpen(open);
          if (!open) {
            saveExerciseMutation.reset();
          }
        }}
        onSubmit={(payload) => saveExerciseMutation.mutate(payload)}
      />

      <QuizModal
        open={quizModalOpen}
        exercises={exercisesQuery.data?.items ?? []}
        pending={saveQuizMutation.isPending}
        error={saveQuizMutation.error ?? exercisesQuery.error}
        onOpenChange={(open) => {
          setQuizModalOpen(open);
          if (!open) {
            saveQuizMutation.reset();
          }
        }}
        onSubmit={(payload) => saveQuizMutation.mutate(payload)}
      />
    </div>
  );
}
