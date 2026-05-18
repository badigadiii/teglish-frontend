export type UserRole = "admin" | "moderator" | "user";

export type UserRead = {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  is_active: boolean;
};

export type Token = {
  access_token: string;
  token_type: "bearer";
};

export type RegisterUserPayload = {
  username: string;
  password: string;
  name?: string | null;
};

export type ExerciseType = "grammar" | "translate" | "dictation";

export type GrammarExerciseCreate = {
  type: "grammar";
  exercise_text: string;
  payload: {
    correct_answer: string;
    response_options: string[];
  };
};

export type TranslateExerciseCreate = {
  type: "translate";
  exercise_text: string;
  payload: {
    correct_answers: string[];
    response_options: string[];
  };
};

export type DictationExerciseCreate = {
  type: "dictation";
  exercise_text: string;
  payload: {
    speech_text: string;
    media_filename: string;
  };
};

export type ExerciseCreate =
  | GrammarExerciseCreate
  | TranslateExerciseCreate
  | DictationExerciseCreate;

export type GrammarExerciseUpdate = {
  type: "grammar";
  exercise_text?: string;
  payload?: {
    correct_answer: string;
    response_options: string[];
  };
};

export type TranslateExerciseUpdate = {
  type: "translate";
  exercise_text?: string;
  payload?: {
    correct_answers: string[];
    response_options: string[];
  };
};

export type DictationExerciseUpdate = {
  type: "dictation";
  exercise_text?: string;
  payload?: {
    speech_text: string;
    media_filename: string;
  };
};

export type ExerciseTextUpdate = {
  exercise_text?: string;
  type?: null;
  payload?: null;
};

export type ExerciseUpdate =
  | GrammarExerciseUpdate
  | TranslateExerciseUpdate
  | DictationExerciseUpdate
  | ExerciseTextUpdate;

export type GrammarExerciseRead = {
  id: number;
  author_id: number;
  exercise_text: string;
  type: "grammar";
  payload: {
    correct_answer: string;
    response_options: string[];
  };
};

export type TranslateExerciseRead = {
  id: number;
  author_id: number;
  exercise_text: string;
  type: "translate";
  payload: {
    correct_answers: string[];
    response_options: string[];
  };
};

export type DictationExerciseRead = {
  id: number;
  author_id: number;
  exercise_text: string;
  type: "dictation";
  payload: {
    speech_text: string;
    media_filename: string;
  };
};

export type ExerciseRead =
  | GrammarExerciseRead
  | TranslateExerciseRead
  | DictationExerciseRead;

export type ChoiceExerciseQuestionResponse = {
  type: "grammar" | "translate";
  exercise_text: string;
  response_options: string[];
};

export type DictationExerciseQuestionResponse = {
  type: "dictation";
  exercise_text: string;
  media_url: string;
};

export type ExerciseQuestionResponse =
  | ChoiceExerciseQuestionResponse
  | DictationExerciseQuestionResponse;

export type PerformExerciseRequest =
  | {
      type: "grammar";
      answer: string;
    }
  | {
      type: "translate";
      answer: string;
    }
  | {
      type: "dictation";
      answer: string;
    };

export type PerformExerciseResponse = {
  message: "ok" | "wrong answer";
};

export type MediaUploadResponse = {
  media_filename: string;
  extension: string;
  media_url: string;
};

export type QuizRead = {
  id: number;
  author_id: number;
  title: string;
  description: string | null;
  exercise_ids: number[];
};

export type QuizCreate = {
  title: string;
  description?: string | null;
  exercise_ids: number[];
};

export type QuizUpdate = {
  title?: string;
  description?: string | null;
  exercise_ids?: number[];
};

export type QuizQuestionRead = {
  exercise_id: number;
  order_index: number;
  question: ExerciseQuestionResponse;
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

export type QuizStartResponse = QuizSessionRead & {
  questions: QuizQuestionRead[];
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

export type QuizAttemptRead = {
  exercise_id: number;
  answer: string;
  is_correct: boolean;
  answered_at: string;
};

export type QuizSessionDetail = QuizSessionRead & {
  attempts: QuizAttemptRead[];
};
