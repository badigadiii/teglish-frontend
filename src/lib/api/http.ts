import { getStoredAccessToken } from "@/lib/auth/token-storage";
import { env } from "@/lib/config/env";
import { ApiError } from "@/lib/errors/api-error";

type RequestBody = BodyInit | Record<string, unknown> | null | undefined;

type ApiRequestOptions = {
  path: string;
  method?: string;
  body?: RequestBody;
  headers?: HeadersInit;
};

let unauthorizedHandler: (() => void) | null = null;

function isBodyInit(value: RequestBody): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  );
}

function getDefaultMessage(status: number) {
  if (status === 401) {
    return "Your session is no longer valid. Sign in again.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested resource was not found.";
  }

  if (status === 409) {
    return "The request conflicts with the current data.";
  }

  if (status === 422) {
    return "Please review the highlighted fields.";
  }

  if (status >= 500) {
    return "The backend returned an unexpected error.";
  }

  return "The request could not be completed.";
}

function toFieldErrors(detail: unknown) {
  if (!Array.isArray(detail)) {
    return undefined;
  }

  const fieldErrors: Record<string, string> = {};

  for (const issue of detail) {
    if (
      !issue ||
      typeof issue !== "object" ||
      !("loc" in issue) ||
      !("msg" in issue)
    ) {
      continue;
    }

    const loc = Array.isArray(issue.loc) ? issue.loc : [];
    const key =
      loc
        .filter(
          (part: unknown): part is string | number =>
            part !== "body" && part !== "query" && part !== "path",
        )
        .join(".") || "root";

    fieldErrors[key] = String(issue.msg);
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : undefined;
}

function normalizeError(status: number, payload: unknown) {
  if (typeof payload === "string" && payload.trim().length > 0) {
    return new ApiError(status, payload);
  }

  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = payload.detail;

    if (typeof detail === "string" && detail.trim().length > 0) {
      return new ApiError(status, detail);
    }

    const fieldErrors = toFieldErrors(detail);
    return new ApiError(status, getDefaultMessage(status), fieldErrors);
  }

  return new ApiError(status, getDefaultMessage(status));
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function buildBackendUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${env.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildAppApiPath(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `/api${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveApiUrl(pathOrUrl: string) {
  return buildAppApiPath(pathOrUrl);
}

export async function apiRequest<T>({
  path,
  method = "GET",
  body,
  headers,
}: ApiRequestOptions): Promise<T> {
  const token = getStoredAccessToken();
  const requestHeaders = new Headers(headers);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (isBodyInit(body)) {
      requestBody = body;
    } else {
      requestHeaders.set("Content-Type", "application/json");
      requestBody = JSON.stringify(body);
    }
  }

  const response = await fetch(buildAppApiPath(path), {
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const error = normalizeError(response.status, payload);

    if (response.status === 401) {
      unauthorizedHandler?.();
    }

    throw error;
  }

  return payload as T;
}
