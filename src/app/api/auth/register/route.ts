import { registerSchema } from "@/features/auth/schemas";
import { requestCurrentUser, requestToken } from "@/features/auth/server";
import type { UserRead } from "@/features/auth/types";
import { backendClient } from "@/lib/api/backend-client";
import { toErrorResponse } from "@/lib/api/errors";
import { setSessionToken } from "@/lib/session/cookies";

export async function POST(request: Request) {
  try {
    const values = registerSchema.parse(await request.json());

    await backendClient.post<UserRead>("/auth/register", values);

    const token = await requestToken(values.username, values.password);
    await setSessionToken(token.access_token);
    const user = await requestCurrentUser(token.access_token);

    return Response.json(user, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
