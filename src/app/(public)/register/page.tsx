import { PageHeader } from "@/components/layout/page-header";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-start">
      <PageHeader
        eyebrow="Authentication"
        title="Create a learner account"
        description="Registration is open through the backend auth endpoints. The frontend validates the same field constraints before sending the request."
      />
      <RegisterForm />
    </div>
  );
}
