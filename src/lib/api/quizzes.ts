import { apiRequest } from "@/lib/api/http";
import type {
  QuizAnswerRequest,
  QuizAnswerResponse,
  QuizCreate,
  QuizRead,
  QuizSessionDetail,
  QuizStartResponse,
  QuizUpdate,
} from "@/lib/api/types";

export function getQuizzes() {
  return apiRequest<QuizRead[]>({
    path: "/quizzes",
  });
}

export function createQuiz(payload: QuizCreate) {
  return apiRequest<QuizRead>({
    path: "/quizzes",
    method: "POST",
    body: payload,
  });
}

export function getQuiz(id: number | string) {
  return apiRequest<QuizRead>({
    path: `/quizzes/${id}`,
  });
}

export function updateQuiz(id: number | string, payload: QuizUpdate) {
  return apiRequest<QuizRead>({
    path: `/quizzes/${id}`,
    method: "PATCH",
    body: payload,
  });
}

export function deleteQuiz(id: number | string) {
  return apiRequest<void>({
    path: `/quizzes/${id}`,
    method: "DELETE",
  });
}

export function startQuiz(id: number | string) {
  return apiRequest<QuizStartResponse>({
    path: `/quizzes/${id}/perform/start`,
    method: "POST",
  });
}

export function answerQuizSession(
  sessionId: number | string,
  payload: QuizAnswerRequest,
) {
  return apiRequest<QuizAnswerResponse>({
    path: `/quizzes/sessions/${sessionId}/answer`,
    method: "POST",
    body: payload,
  });
}

export function finishQuizSession(sessionId: number | string) {
  return apiRequest<QuizSessionDetail>({
    path: `/quizzes/sessions/${sessionId}/finish`,
    method: "POST",
  });
}

export function getQuizSession(sessionId: number | string) {
  return apiRequest<QuizSessionDetail>({
    path: `/quizzes/sessions/${sessionId}`,
  });
}
