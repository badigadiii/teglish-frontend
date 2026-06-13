export type UserRole = "admin" | "moderator" | "user";

export type UserRead = {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  is_active: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
};

export type ApiErrorResponse = {
  message: string;
  status: number;
  code: string;
};
