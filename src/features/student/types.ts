export type PageResponse<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type ExerciseType = "translate" | "grammar" | "dictation";

export type ChoiceQuestion = {
  type: "translate" | "grammar";
  exercise_text: string;
  response_options: string[];
};

export type DictationQuestion = {
  type: "dictation";
  exercise_text: string;
  media_url: string;
};

export type StudentQuestion = ChoiceQuestion | DictationQuestion;

export type PublicExercise = {
  id: number;
  author_id: number;
  public: boolean;
  type: ExerciseType;
  exercise_text: string;
  question: StudentQuestion;
};

export type PublicQuiz = {
  id: number;
  author_id: number;
  title: string;
  description: string | null;
  exercise_ids: number[];
  public: boolean;
};

export type QuizQuestion = {
  exercise_id: number;
  order_index: number;
  question: StudentQuestion;
};

export type QuizStartResponse = {
  id: number;
  quiz_id: number;
  user_id: number;
  status: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  started_at: string;
  finished_at: string | null;
  questions: QuizQuestion[];
};

export type QuizAnswerRequest = {
  exercise_id: number;
  answer: string;
};

export type QuizAnswerResponse = {
  exercise_id: number;
  is_correct: boolean;
  answered_questions: number;
  correct_answers: number;
};

export type StandalonePerformRequest =
  | { type: "translate"; answer: string }
  | { type: "grammar"; answer: string }
  | { type: "dictation"; answer: string };

export type PerformExerciseResponse = {
  message: "ok" | "wrong answer";
};

export type QuizAttempt = {
  exercise_id: number;
  answer: string;
  is_correct: boolean;
  answered_at: string;
};

export type QuizSessionRead = {
  id: number;
  quiz_id: number;
  user_id: number;
  status: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  started_at: string;
  finished_at: string | null;
};

export type QuizSessionDetail = QuizSessionRead & {
  attempts: QuizAttempt[];
};

export type AnswerFeedback =
  | { status: "correct"; message: "Correct" }
  | { status: "wrong"; message: "Wrong answer" };
