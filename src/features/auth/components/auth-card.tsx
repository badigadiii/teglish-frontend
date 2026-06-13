"use client";

import { ArrowLeft, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";

type AuthMode = "register" | "login";
type AuthView = "landing" | AuthMode;

const lessonPreviews = [
  {
    label: "Перевод",
    labelClassName: "bg-primary/15 text-[#7fed2a]",
    title: "Я скоро вернусь.",
    description: "I will be back soon.",
  },
  {
    label: "Грамматика",
    labelClassName: "bg-sky-500/15 text-sky-200",
    title: "She ___ watching a movie.",
    description: "Выберите правильный вариант.",
  },
  {
    label: "Диктант",
    labelClassName: "bg-amber-500/15 text-amber-100",
    title: "Послушайте фразу",
    description: "Введите услышанный текст.",
  },
];

export function AuthCard({
  initialMode,
  sessionExpired,
}: {
  initialMode: AuthMode;
  sessionExpired: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<AuthView>(
    initialMode === "login" ? "login" : "landing",
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setView(initialMode === "login" ? "login" : "landing");
  }, [initialMode]);

  const mode: AuthMode = view === "login" ? "login" : "register";

  return (
    <main className="mx-auto grid min-h-screen w-[min(1280px,calc(100%-32px))] items-center py-8">
      {view === "landing" ? (
        <section className="relative grid min-h-[620px] overflow-hidden rounded-[36px] border border-white/12 bg-slate-950/75 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 flex flex-col justify-center gap-5 p-4 sm:p-8">
            <div className="inline-flex items-center gap-3 text-[26px] font-black tracking-normal">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <BookOpen className="size-7" />
              </div>
              <span>Teglish</span>
            </div>

            <p className="w-fit rounded-full bg-sky-500/15 px-3 py-2 text-sm font-black text-sky-200">
              Платформа для практики английского
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.9] tracking-normal sm:text-7xl lg:text-[92px]">
              Английский через квизы и упражнения
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Teglish помогает практиковать английский через короткие задания на
              перевод, грамматику и аудирование. Создавайте собственные
              упражнения, собирайте квизы и отслеживайте свои попытки
              прохождения.
            </p>

            <div className="mt-2 flex flex-wrap gap-3">
              <Button
                type="button"
                size="lg"
                className="h-12 rounded-2xl px-6 text-base font-black text-white shadow-[inset_0_-4px_rgba(0,0,0,0.13)]"
                disabled={!mounted}
                onClick={() => setView("register")}
              >
                Начать обучение
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-12 rounded-2xl border-2 border-sky-400/35 bg-sky-500/10 px-6 text-base font-black text-sky-200 shadow-[inset_0_-4px_rgba(28,176,246,0.12)] hover:bg-sky-500/15 hover:text-sky-100"
                disabled={!mounted}
                onClick={() => setView("login")}
              >
                Войти
              </Button>
            </div>
          </div>

          <div
            className="relative z-10 grid min-h-[520px] content-center gap-4.5 rounded-[30px] border border-white/12 p-7"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(88, 204, 2, .32), transparent 15rem), radial-gradient(circle at 70% 80%, rgba(28, 176, 246, .20), transparent 16rem), rgba(255, 255, 255, .07)",
            }}
            aria-hidden="true"
          >
            {lessonPreviews.map((lesson, index) => (
              <div
                key={lesson.label}
                className="rounded-3xl border border-white/12 bg-slate-900/75 p-4.5 shadow-[0_12px_28px_rgba(0,0,0,.32)]"
                style={{
                  marginLeft: index === 1 ? "52px" : undefined,
                  marginRight: index === 2 ? "44px" : undefined,
                }}
              >
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-sm font-black ${lesson.labelClassName}`}
                >
                  {lesson.label}
                </span>
                <h2 className="mt-3 text-xl font-bold tracking-normal">
                  {lesson.title}
                </h2>
                <p className="mt-1 leading-6 text-muted-foreground">
                  {lesson.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section
          className="m-auto w-full max-w-xl"
          aria-label={
            mode === "login" ? "Вход в Teglish" : "Регистрация в Teglish"
          }
        >
          <Card className="rounded-[30px] border-white/12 bg-slate-950/85 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <CardHeader className="gap-4">
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-fit rounded-2xl px-3 font-bold text-muted-foreground hover:text-foreground"
                onClick={() => setView("landing")}
              >
                <ArrowLeft />
                Назад
              </Button>
              <div className="grid gap-3">
                <p className="w-fit rounded-full bg-sky-500/15 px-3 py-2 text-sm font-black text-sky-200">
                  {mode === "login" ? "Вход в аккаунт" : "Создание аккаунта"}
                </p>
                <CardTitle className="text-3xl font-black tracking-normal">
                  {mode === "login" ? "С возвращением" : "Начать обучение"}
                </CardTitle>
                <CardDescription className="text-base leading-7">
                  {sessionExpired
                    ? "Сессия истекла. Войдите снова, чтобы продолжить."
                    : mode === "login"
                      ? "Введите данные и перейдите к учебному dashboard."
                      : "Создайте аккаунт, чтобы перейти к упражнениям и квизам."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              {mode === "login" ? <LoginForm /> : <RegisterForm />}
              <p className="text-sm font-bold text-muted-foreground">
                {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                <button
                  type="button"
                  className="font-black text-[#7fed2a]"
                  onClick={() =>
                    setView(mode === "login" ? "register" : "login")
                  }
                >
                  {mode === "login" ? "Зарегистрироваться" : "Войти"}
                </button>
              </p>
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}
