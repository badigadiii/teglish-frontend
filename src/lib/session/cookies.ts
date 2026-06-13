import { cookies } from "next/headers";

export const sessionCookieName = "teglish_access_token";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function getSessionToken() {
  const cookieStore = await cookies();

  return cookieStore.get(sessionCookieName)?.value ?? null;
}

export async function setSessionToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, cookieOptions);
}

export async function clearSessionToken() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}
