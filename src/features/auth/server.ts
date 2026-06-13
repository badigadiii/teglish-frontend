import type { TokenResponse, UserRead } from "@/features/auth/types";
import { backendClient, withBearerToken } from "@/lib/api/backend-client";

export async function requestToken(username: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const response = await backendClient.post<TokenResponse>(
    "/auth/token",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
}

export async function requestCurrentUser(token: string) {
  const response = await backendClient.get<UserRead>(
    "/users/me",
    withBearerToken(token),
  );

  return response.data;
}
