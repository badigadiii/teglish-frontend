import type { TokenResponse, UserRead } from "@/features/auth/types";
import { backendFetch } from "@/lib/api/backend-fetch";

export async function requestToken(username: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  return backendFetch<TokenResponse>("/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}

export async function requestCurrentUser(token: string) {
  return backendFetch<UserRead>("/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
