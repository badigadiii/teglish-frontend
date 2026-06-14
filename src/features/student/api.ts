"use client";

import type {
  PageResponse,
  PerformExerciseResponse,
  PublicExercise,
  PublicQuiz,
  QuizAnswerRequest,
  QuizAnswerResponse,
  QuizSessionDetail,
  QuizSessionRead,
  QuizStartResponse,
  StandalonePerformRequest,
  StudentQuestion,
} from "@/features/student/types";
import { apiClient } from "@/lib/api/client";

export async function getPublicQuizzes(page = 1, size = 20) {
  const response = await apiClient.get<PageResponse<PublicQuiz>>(
    "/api/public/quizzes",
    { params: { page, size } },
  );

  return response.data;
}

export async function getPublicQuiz(quizId: number) {
  const response = await apiClient.get<PublicQuiz>(
    `/api/public/quizzes/${quizId}`,
  );

  return response.data;
}

export async function getPublicExercises(page = 1, size = 20) {
  const response = await apiClient.get<PageResponse<PublicExercise>>(
    "/api/public/exercises",
    { params: { page, size } },
  );

  return response.data;
}

export async function getExerciseQuestion(exerciseId: number) {
  const response = await apiClient.get<StudentQuestion>(
    `/api/exercises/${exerciseId}/question`,
  );

  return response.data;
}

export async function performExercise(
  exerciseId: number,
  payload: StandalonePerformRequest,
) {
  const response = await apiClient.post<PerformExerciseResponse>(
    `/api/exercises/${exerciseId}/perform`,
    payload,
  );

  return response.data;
}

export async function startQuiz(quizId: number) {
  const response = await apiClient.post<QuizStartResponse>(
    `/api/quizzes/${quizId}/start`,
  );

  return response.data;
}

export async function answerQuizSession(
  sessionId: number,
  payload: QuizAnswerRequest,
) {
  const response = await apiClient.post<QuizAnswerResponse>(
    `/api/quizzes/sessions/${sessionId}/answer`,
    payload,
  );

  return response.data;
}

export async function finishQuizSession(sessionId: number) {
  const response = await apiClient.post<QuizSessionDetail>(
    `/api/quizzes/sessions/${sessionId}/finish`,
  );

  return response.data;
}

export async function getQuizSession(sessionId: number) {
  const response = await apiClient.get<QuizSessionDetail>(
    `/api/quizzes/sessions/${sessionId}`,
  );

  return response.data;
}

export async function getMyQuizSessions(page = 1, size = 20) {
  const response = await apiClient.get<PageResponse<QuizSessionRead>>(
    "/api/users/me/quiz-sessions",
    { params: { page, size } },
  );

  return response.data;
}

export async function getMyQuizSessionsByQuiz(
  quizId: number,
  page = 1,
  size = 20,
) {
  const response = await apiClient.get<PageResponse<QuizSessionRead>>(
    `/api/users/me/quizzes/${quizId}/sessions`,
    { params: { page, size } },
  );

  return response.data;
}
