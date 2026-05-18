"use client";

import { useParams } from "next/navigation";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function QuizDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <FeaturePlaceholder
      ctaHref="/quizzes/new"
      ctaLabel="Open quiz shell"
      description={`Quiz #${params.id} detail route is prepared for authenticated learners and authors, but the data UI ships in a later stage.`}
      stage="Stage 2-5 scaffold"
      title="Quiz detail shell"
    />
  );
}
