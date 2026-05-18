"use client";

import { useParams } from "next/navigation";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function EditExercisePage() {
  const params = useParams<{ id: string }>();

  return (
    <FeaturePlaceholder
      ctaHref="/exercises/new"
      ctaLabel="Open exercise shell"
      description={`Exercise #${params.id} edit route is reserved and protected. Full read/update flows are scheduled for the authoring stage.`}
      stage="Stage 2-5 scaffold"
      title="Exercise edit shell"
    />
  );
}
