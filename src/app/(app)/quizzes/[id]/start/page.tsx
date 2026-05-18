"use client";

import { useParams } from "next/navigation";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function StartQuizPage() {
  const params = useParams<{ id: string }>();

  return (
    <FeaturePlaceholder
      ctaHref={`/quizzes/${params.id}`}
      ctaLabel="Open quiz detail shell"
      description={`Quiz #${params.id} start route will use authenticated session start endpoints in the quiz stage.`}
      stage="Stage 2-5 scaffold"
      title="Quiz start shell"
    />
  );
}
