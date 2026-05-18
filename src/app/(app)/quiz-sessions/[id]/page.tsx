"use client";

import { useParams } from "next/navigation";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function QuizSessionPage() {
  const params = useParams<{ id: string }>();

  return (
    <FeaturePlaceholder
      ctaHref="/profile"
      ctaLabel="Back to profile"
      description={`Quiz session #${params.id} route already exists in navigation, ready for active and finished session UIs later.`}
      stage="Stage 2-5 scaffold"
      title="Quiz session shell"
    />
  );
}
