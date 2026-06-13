export const creatorKeys = {
  all: ["creator"] as const,
  exercises: () => [...creatorKeys.all, "exercises"] as const,
  exercise: (id: number) => [...creatorKeys.exercises(), id] as const,
  quizzes: () => [...creatorKeys.all, "quizzes"] as const,
  quiz: (id: number) => [...creatorKeys.quizzes(), id] as const,
  media: (page = 1, size = 20) =>
    [...creatorKeys.all, "media", page, size] as const,
  sessions: (page = 1, size = 20) =>
    [...creatorKeys.all, "sessions", page, size] as const,
};
