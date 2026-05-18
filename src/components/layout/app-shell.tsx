import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { MainNav } from "@/components/layout/main-nav";
import { StaffNav } from "@/components/layout/staff-nav";

type AppShellProps = {
  variant: "public" | "app" | "staff";
  children: ReactNode;
};

export function AppShell({ variant, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <AppHeader variant={variant} />

      {variant !== "public" ? (
        <div className="border-b">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 md:px-6 lg:px-8">
            <MainNav />
            {variant === "staff" ? <StaffNav /> : null}
          </div>
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
