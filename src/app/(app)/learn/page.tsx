import { BookCheck, Headphones, Languages, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  {
    title: "Переводы",
    description: "Тренируйте устойчивые фразы и короткие ответы.",
    icon: Languages,
  },
  {
    title: "Грамматика",
    description: "Закрепляйте правила через быстрый выбор ответа.",
    icon: BookCheck,
  },
  {
    title: "Диктанты",
    description: "Слушайте фразы и набирайте услышанный текст.",
    icon: Headphones,
  },
];

export default function LearnPage() {
  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <p className="flex w-fit items-center gap-2 rounded-full bg-primary/15 px-3 py-1.5 text-sm font-bold text-primary">
          <Sparkles className="size-4" />
          Главная
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal md:text-6xl">
          Выберите короткую практику и продолжайте обучение
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          Первый защищенный экран уже использует реальную сессию и данные
          пользователя из backend.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="bg-card/80">
            <CardHeader>
              <div className="mb-3 grid size-11 place-items-center rounded-lg bg-primary/15 text-primary">
                <card.icon className="size-5" />
              </div>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
