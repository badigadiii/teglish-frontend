"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import type { UserRole } from "@/lib/api/types";

type GuardProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: GuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authError, hasToken, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !hasToken) {
      const params = new URLSearchParams({ redirect: pathname });
      router.replace(`/login?${params.toString()}`);
    }
  }, [hasToken, isLoading, pathname, router]);

  if (isLoading) {
    return <LoadingState fullScreen label="Checking your session" />;
  }

  if (!hasToken) {
    return <LoadingState fullScreen label="Redirecting to sign in" />;
  }

  if (authError && !user) {
    return (
      <ErrorState
        actionHref="/login"
        actionLabel="Open login"
        description="The app could not confirm your current account. Try signing in again."
        error={authError}
        title="Session verification failed"
      />
    );
  }

  return <>{children}</>;
}

type RequireRoleProps = GuardProps & {
  allowedRoles: UserRole[];
};

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingState fullScreen label="Checking staff permissions" />;
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <ErrorState
        actionHref="/profile"
        actionLabel="Back to profile"
        description="The backend enforces the same role rules. This screen stays hidden here to avoid dead-end navigation."
        error={new Error("Insufficient role for staff-only routes.")}
        title="Staff area is restricted"
      />
    );
  }

  return <>{children}</>;
}
