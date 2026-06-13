import "server-only";

import type { AxiosRequestConfig } from "axios";

import { backendClient, withBearerToken } from "@/lib/api/backend-client";
import { ApiError, toErrorResponse } from "@/lib/api/errors";
import { getSessionToken } from "@/lib/session/cookies";

export async function requireSessionToken() {
  const token = await getSessionToken();

  if (!token) {
    throw new ApiError({
      status: 401,
      code: "NO_SESSION",
      message: "Сессия не найдена",
    });
  }

  return token;
}

export async function proxyBackend<T>(
  path: string,
  config: AxiosRequestConfig = {},
) {
  const token = await requireSessionToken();
  const response = await backendClient.request<T>({
    url: path,
    ...withBearerToken(token, config),
  });

  if (response.status === 204) {
    return new Response(null, { status: 204 });
  }

  return Response.json(response.data, { status: response.status });
}

export function handleRouteError(error: unknown) {
  return toErrorResponse(error);
}
