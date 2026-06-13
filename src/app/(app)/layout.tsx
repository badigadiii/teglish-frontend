import { redirect } from "next/navigation";

import { AppShell } from "@/features/auth/components/app-shell";
import { requestCurrentUser } from "@/features/auth/server";
import { getSessionToken } from "@/lib/session/cookies";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getSessionToken();

  if (!token) {
    redirect("/");
  }

  try {
    const user = await requestCurrentUser(token);

    return <AppShell user={user}>{children}</AppShell>;
  } catch {
    redirect("/?session=expired");
  }
}
