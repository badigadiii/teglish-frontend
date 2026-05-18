import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FeaturePlaceholderProps = {
  stage: string;
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function FeaturePlaceholder({
  stage,
  title,
  description,
  ctaHref,
  ctaLabel,
}: FeaturePlaceholderProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={stage}
        title={title}
        description={description}
        actions={<Badge variant="outline">Planned in later stages</Badge>}
      />
      <EmptyState
        title="This screen is scaffolded"
        description="The route is wired into the final navigation structure already. Business logic for this area lands in the next frontend stages."
        actionHref={ctaHref}
        actionLabel={ctaLabel}
        secondaryAction={
          <Button asChild variant="outline">
            <Link href="/profile">Back to profile</Link>
          </Button>
        }
      />
    </div>
  );
}
