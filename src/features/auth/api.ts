import type { LoginValues, RegisterValues } from "@/features/auth/schemas";
import type { ApiErrorResponse, UserRead } from "@/features/auth/types";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

function toClientError(error: unknown): never {
  if (error instanceof ApiError) {
    throw new Error(error.message);
  }

  throw error;
}

export async function login(values: LoginValues): Promise<UserRead> {
  try {
    const response = await apiClient.post<UserRead>("/api/auth/login", values);
    return response.data;
  } catch (error) {
    return toClientError(error);
  }
}

export async function register(values: RegisterValues): Promise<UserRead> {
  try {
    const response = await apiClient.post<UserRead>(
      "/api/auth/register",
      values,
    );
    return response.data;
  } catch (error) {
    return toClientError(error);
  }
}

export async function getCurrentUser(): Promise<UserRead | null> {
  try {
    const response = await apiClient.get<UserRead>("/api/auth/me");
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && [400, 401].includes(error.status)) {
      return null;
    }

    return toClientError(error);
  }
}

export async function logout(): Promise<void> {
  await apiClient.post<ApiErrorResponse>("/api/auth/logout");
}
