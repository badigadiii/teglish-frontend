import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <AppShell variant="public">{children}</AppShell>;
}
