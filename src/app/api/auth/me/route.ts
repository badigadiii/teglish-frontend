import { requestCurrentUser } from "@/features/auth/server";
import { ApiError, toErrorResponse } from "@/lib/api/errors";
import { clearSessionToken, getSessionToken } from "@/lib/session/cookies";

export async function GET() {
  const token = await getSessionToken();

  if (!token) {
    return Response.json(
      {
        message: "Сессия не найдена",
        status: 401,
        code: "NO_SESSION",
      },
      { status: 401 },
    );
  }

  try {
    const user = await requestCurrentUser(token);

    return Response.json(user);
  } catch (error) {
    if (error instanceof ApiError && [400, 401].includes(error.status)) {
      await clearSessionToken();
    }

    return toErrorResponse(error);
  }
}
