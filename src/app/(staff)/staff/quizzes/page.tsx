import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function StaffQuizzesPage() {
  return (
    <FeaturePlaceholder
      ctaHref="/staff"
      ctaLabel="Back to staff dashboard"
      description="The staff-only quizzes list route is scaffolded and role-gated. Full moderation and list UI lands in the dedicated staff stage."
      stage="Stage 2-5 scaffold"
      title="Staff quizzes shell"
    />
  );
}
