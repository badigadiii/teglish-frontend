export type PageResponse<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type ExerciseType = "translate" | "grammar" | "dictation";

export type ExerciseBase = {
  id: number;
  author_id: number;
  exercise_text: string;
  public: boolean;
};

export type TranslateExercise = ExerciseBase & {
  type: "translate";
  payload: {
    correct_answers?: string[];
    response_options?: string[];
  };
};

export type GrammarExercise = ExerciseBase & {
  type: "grammar";
  payload: {
    correct_answer: string;
    response_options?: string[];
  };
};

export type DictationExercise = ExerciseBase & {
  type: "dictation";
  payload: {
    speech_text: string;
    media_filename: string;
  };
};

export type ExerciseRead =
  | TranslateExercise
  | GrammarExercise
  | DictationExercise;

export type ExercisePayload =
  | {
      exercise_text: string;
      public: boolean;
      type: "translate";
      payload: {
        correct_answers: string[];
        response_options: string[];
      };
    }
  | {
      exercise_text: string;
      public: boolean;
      type: "grammar";
      payload: {
        correct_answer: string;
        response_options: string[];
      };
    }
  | {
      exercise_text: string;
      public: boolean;
      type: "dictation";
      payload: {
        speech_text: string;
        media_filename: string;
      };
    };

export type QuizRead = {
  id: number;
  author_id: number;
  title: string;
  description: string | null;
  exercise_ids: number[];
  public: boolean;
};

export type QuizPayload = {
  title: string;
  description: string | null;
  exercise_ids: number[];
  public: boolean;
};

export type MediaRead = {
  author_id: number;
  media_filename: string;
  extension: string;
  media_url: string;
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
