import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/states/loading-state";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-start">
      <PageHeader
        eyebrow="Authentication"
        title="Enter Teglish"
        description="Sign in to access profile, learner authoring shortcuts, and future quiz session routes."
      />
      <Suspense fallback={<LoadingState label="Preparing sign-in form" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
