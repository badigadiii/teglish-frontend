import Link from "next/link";

import { ApiErrorAlert } from "@/components/shared/api-error-alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ErrorStateProps = {
  title: string;
  description: string;
  error: unknown;
  actionLabel?: string;
  actionHref?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title,
  description,
  error,
  actionLabel,
  actionHref,
  retryLabel,
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ApiErrorAlert error={error} />
        <div className="flex flex-wrap gap-3">
          {onRetry && retryLabel ? (
            <Button onClick={onRetry} type="button">
              {retryLabel}
            </Button>
          ) : null}
          {actionLabel && actionHref ? (
            <Button asChild variant="outline">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
