"use client";

import type {
  ExercisePayload,
  ExerciseRead,
  MediaRead,
  PageResponse,
  QuizPayload,
  QuizRead,
  QuizSessionRead,
} from "@/features/creator/types";
import { apiClient } from "@/lib/api/client";

function normalizePage<T>(data: PageResponse<T> | T[]): PageResponse<T> {
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      size: data.length,
      pages: 1,
    };
  }

  return data;
}

export async function getMyExercises() {
  const response = await apiClient.get<
    PageResponse<ExerciseRead> | ExerciseRead[]
  >("/api/users/me/exercises");

  return normalizePage(response.data);
}

export async function getExercise(exerciseId: number) {
  const response = await apiClient.get<ExerciseRead>(
    `/api/exercises/${exerciseId}`,
  );

  return response.data;
}

export async function createExercise(payload: ExercisePayload) {
  const response = await apiClient.post<ExerciseRead>(
    "/api/exercises",
    payload,
  );

  return response.data;
}

export async function updateExercise(
  exerciseId: number,
  payload: ExercisePayload,
) {
  const response = await apiClient.patch<ExerciseRead>(
    `/api/exercises/${exerciseId}`,
    payload,
  );

  return response.data;
}

export async function deleteExercise(exerciseId: number) {
  await apiClient.delete(`/api/exercises/${exerciseId}`);
}

export async function getMyQuizzes() {
  const response = await apiClient.get<PageResponse<QuizRead> | QuizRead[]>(
    "/api/users/me/quizzes",
  );

  return normalizePage(response.data);
}

export async function getQuiz(quizId: number) {
  const response = await apiClient.get<QuizRead>(`/api/quizzes/${quizId}`);

  return response.data;
}

export async function createQuiz(payload: QuizPayload) {
  const response = await apiClient.post<QuizRead>("/api/quizzes", payload);

  return response.data;
}

export async function updateQuiz(quizId: number, payload: QuizPayload) {
  const response = await apiClient.patch<QuizRead>(
    `/api/quizzes/${quizId}`,
    payload,
  );

  return response.data;
}

export async function deleteQuiz(quizId: number) {
  await apiClient.delete(`/api/quizzes/${quizId}`);
}

export async function getMyMedia(page = 1, size = 20) {
  const response = await apiClient.get<PageResponse<MediaRead>>(
    "/api/users/me/media",
    { params: { page, size } },
  );

  return response.data;
}

export async function uploadMedia(file: File, name?: string) {
  const formData = new FormData();
  formData.set("file", file);

  if (name?.trim()) {
    formData.set("name", name.trim());
  }

  const response = await apiClient.post<MediaRead>("/api/media", formData);

  return response.data;
}

export async function deleteMedia(mediaFilename: string) {
  await apiClient.delete(`/api/media/${encodeURIComponent(mediaFilename)}`);
}

export async function getMyQuizSessions(page = 1, size = 20) {
  const response = await apiClient.get<PageResponse<QuizSessionRead>>(
    "/api/users/me/quiz-sessions",
    { params: { page, size } },
  );

  return response.data;
}
