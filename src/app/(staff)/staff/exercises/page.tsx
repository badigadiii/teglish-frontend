import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function StaffExercisesPage() {
  return (
    <FeaturePlaceholder
      ctaHref="/staff"
      ctaLabel="Back to staff dashboard"
      description="The staff-only exercises list route is protected and visible only for `admin` and `moderator`. Data tables arrive in the moderation stage."
      stage="Stage 2-5 scaffold"
      title="Staff exercises shell"
    />
  );
}
