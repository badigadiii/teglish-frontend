"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import type { UserRole } from "@/lib/api/types";

type RoleGateProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGate({
  allowedRoles,
  children,
  fallback = null,
}: RoleGateProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
