import { apiRequest } from "@/lib/api/http";
import type {
  ExerciseCreate,
  ExerciseQuestionResponse,
  ExerciseRead,
  ExerciseUpdate,
  PerformExerciseRequest,
  PerformExerciseResponse,
} from "@/lib/api/types";

export function getExercises() {
  return apiRequest<ExerciseRead[]>({
    path: "/exercises",
  });
}

export function getExercise(id: number | string) {
  return apiRequest<ExerciseRead>({
    path: `/exercises/${id}`,
  });
}

export function getExerciseQuestion(id: number | string) {
  return apiRequest<ExerciseQuestionResponse>({
    path: `/exercises/${id}/question`,
  });
}

export function createExercise(payload: ExerciseCreate) {
  return apiRequest<ExerciseRead>({
    path: "/exercises",
    method: "POST",
    body: payload,
  });
}

export function updateExercise(id: number | string, payload: ExerciseUpdate) {
  return apiRequest<ExerciseRead>({
    path: `/exercises/${id}`,
    method: "PATCH",
    body: payload,
  });
}

export function deleteExercise(id: number | string) {
  return apiRequest<void>({
    path: `/exercises/${id}`,
    method: "DELETE",
  });
}

export function performExercise(
  id: number | string,
  payload: PerformExerciseRequest,
) {
  return apiRequest<PerformExerciseResponse>({
    path: `/exercises/${id}/perform`,
    method: "POST",
    body: payload,
  });
}
