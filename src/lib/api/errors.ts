export type ApiErrorBody = {
  message: string;
  status: number;
  code: string;
};

export class ApiError extends Error {
  status: number;
  code: string;
  detail: unknown;

  constructor(body: ApiErrorBody, detail?: unknown) {
    super(body.message);
    this.name = "ApiError";
    this.status = body.status;
    this.code = body.code;
    this.detail = detail;
  }
}

function detailToMessage(detail: unknown): string | null {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];

    if (
      typeof first === "object" &&
      first !== null &&
      "msg" in first &&
      typeof first.msg === "string"
    ) {
      return first.msg;
    }
  }

  return null;
}

export function normalizeApiError(status: number, payload: unknown): ApiError {
  const detail =
    typeof payload === "object" && payload !== null && "detail" in payload
      ? payload.detail
      : payload;
  const backendMessage = detailToMessage(detail);

  if (status === 409) {
    return new ApiError(
      {
        status,
        code: "USERNAME_EXISTS",
        message: "Пользователь с таким username уже существует",
      },
      payload,
    );
  }

  if (status === 401) {
    if (backendMessage === "Incorrect username or password") {
      return new ApiError(
        {
          status,
          code: "INVALID_CREDENTIALS",
          message: "Username или password указаны неверно",
        },
        payload,
      );
    }

    return new ApiError(
      {
        status,
        code: "UNAUTHENTICATED",
        message: backendMessage ?? "Нужно войти в аккаунт",
      },
      payload,
    );
  }

  if (status === 400 && backendMessage === "Unknown media filename") {
    return new ApiError(
      {
        status,
        code: "UNKNOWN_MEDIA_FILENAME",
        message: "Выбранный медиафайл не найден",
      },
      payload,
    );
  }

  if (status === 400 && backendMessage === "Inactive user") {
    return new ApiError(
      {
        status,
        code: "INACTIVE_USER",
        message: "Аккаунт неактивен",
      },
      payload,
    );
  }

  if (status === 422) {
    return new ApiError(
      {
        status,
        code: "VALIDATION_ERROR",
        message: "Поля не соответствуют требованиям сервера",
      },
      payload,
    );
  }

  if (status === 403) {
    return new ApiError(
      {
        status,
        code: "FORBIDDEN",
        message: "Недостаточно прав для этого действия",
      },
      payload,
    );
  }

  if (status === 404) {
    return new ApiError(
      {
        status,
        code: "NOT_FOUND",
        message: "Запись не найдена",
      },
      payload,
    );
  }

  if (status >= 500) {
    return new ApiError(
      {
        status,
        code: "BACKEND_ERROR",
        message: "Сервер временно недоступен",
      },
      payload,
    );
  }

  return new ApiError(
    {
      status,
      code: "REQUEST_FAILED",
      message: backendMessage ?? "Запрос не выполнен",
    },
    payload,
  );
}

export function networkError(): ApiError {
  return new ApiError({
    status: 503,
    code: "NETWORK_ERROR",
    message: "Не удалось подключиться к серверу",
  });
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        message: error.message,
        status: error.status,
        code: error.code,
      } satisfies ApiErrorBody,
      { status: error.status },
    );
  }

  return Response.json(
    {
      message: "Неожиданная ошибка",
      status: 500,
      code: "UNKNOWN_ERROR",
    } satisfies ApiErrorBody,
    { status: 500 },
  );
}
