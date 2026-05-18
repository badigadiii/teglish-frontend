import { apiRequest } from "@/lib/api/http";
import type { UserRead } from "@/lib/api/types";

export function getMe() {
  return apiRequest<UserRead>({
    path: "/users/me",
  });
}
