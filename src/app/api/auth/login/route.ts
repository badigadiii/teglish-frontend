import { loginSchema } from "@/features/auth/schemas";
import { requestCurrentUser, requestToken } from "@/features/auth/server";
import { toErrorResponse } from "@/lib/api/errors";
import { setSessionToken } from "@/lib/session/cookies";

export async function POST(request: Request) {
  try {
    const values = loginSchema.parse(await request.json());
    const token = await requestToken(values.username, values.password);
    await setSessionToken(token.access_token);
    const user = await requestCurrentUser(token.access_token);

    return Response.json(user);
  } catch (error) {
    return toErrorResponse(error);
  }
}
