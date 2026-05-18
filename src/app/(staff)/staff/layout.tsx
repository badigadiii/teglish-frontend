import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth, RequireRole } from "@/lib/auth/guards";

type StaffLayoutProps = {
  children: ReactNode;
};

export default function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={["admin", "moderator"]}>
        <AppShell variant="staff">{children}</AppShell>
      </RequireRole>
    </RequireAuth>
  );
}
