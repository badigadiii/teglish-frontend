export const queryKeys = {
  users: {
    all: ["users"] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
  },
  exercises: {
    all: ["exercises"] as const,
    list: () => [...queryKeys.exercises.all, "list"] as const,
    detail: (id: number | string) =>
      [...queryKeys.exercises.all, "detail", id] as const,
    question: (id: number | string) =>
      [...queryKeys.exercises.all, "question", id] as const,
  },
  quizzes: {
    all: ["quizzes"] as const,
    list: () => [...queryKeys.quizzes.all, "list"] as const,
    detail: (id: number | string) =>
      [...queryKeys.quizzes.all, "detail", id] as const,
    session: (id: number | string) =>
      [...queryKeys.quizzes.all, "session", id] as const,
  },
};
