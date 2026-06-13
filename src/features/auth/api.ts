import type { LoginValues, RegisterValues } from "@/features/auth/schemas";
import type { ApiErrorResponse, UserRead } from "@/features/auth/types";

async function parseApiError(response: Response) {
  let body: ApiErrorResponse | null = null;

  try {
    body = (await response.json()) as ApiErrorResponse;
  } catch {
    body = null;
  }

  throw new Error(body?.message ?? "Запрос не выполнен");
}

export async function login(values: LoginValues): Promise<UserRead> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  return response.json() as Promise<UserRead>;
}

export async function register(values: RegisterValues): Promise<UserRead> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  return response.json() as Promise<UserRead>;
}

export async function getCurrentUser(): Promise<UserRead | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (response.status === 401 || response.status === 400) {
    return null;
  }

  if (!response.ok) {
    await parseApiError(response);
  }

  return response.json() as Promise<UserRead>;
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}
