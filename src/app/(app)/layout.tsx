import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/lib/auth/guards";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AuthenticatedLayout({ children }: AppLayoutProps) {
  return (
    <RequireAuth>
      <AppShell variant="app">{children}</AppShell>
    </RequireAuth>
  );
}
