import { redirect } from "next/navigation";

import { AuthCard } from "@/features/auth/components/auth-card";
import { requestCurrentUser } from "@/features/auth/server";
import { getSessionToken } from "@/lib/session/cookies";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; session?: string }>;
}) {
  const token = await getSessionToken();

  if (token) {
    try {
      await requestCurrentUser(token);
      redirect("/learn");
    } catch {
      // Stale cookies are cleared by /api/auth/me from the client-side session check.
    }
  }

  const params = await searchParams;
  const initialMode =
    params.mode === "login" || params.session === "expired"
      ? "login"
      : "register";

  return (
    <AuthCard
      initialMode={initialMode}
      sessionExpired={params.session === "expired"}
    />
  );
}
