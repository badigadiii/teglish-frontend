export const studentKeys = {
  quizzes: (page: number, size: number) =>
    ["student", "quizzes", page, size] as const,
  quiz: (quizId: number) => ["student", "quiz", quizId] as const,
  exercises: (page: number, size: number) =>
    ["student", "exercises", page, size] as const,
  exerciseQuestion: (exerciseId: number) =>
    ["student", "exercise-question", exerciseId] as const,
  quizSession: (sessionId: number) =>
    ["student", "quiz-session", sessionId] as const,
  mySessions: (page: number, size: number) =>
    ["student", "my-sessions", page, size] as const,
  myQuizSessions: (quizId: number, page: number, size: number) =>
    ["student", "my-quiz-sessions", quizId, page, size] as const,
};
