import { apiRequest } from "@/lib/api/http";
import type { RegisterUserPayload, Token, UserRead } from "@/lib/api/types";

export function registerUser(payload: RegisterUserPayload) {
  return apiRequest<UserRead>({
    path: "/auth/register",
    method: "POST",
    body: payload,
  });
}

export function login(username: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  return apiRequest<Token>({
    path: "/auth/token",
    method: "POST",
    body,
  });
}
