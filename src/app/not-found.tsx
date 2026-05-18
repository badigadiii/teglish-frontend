import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center">
      <EmptyState
        actionHref="/"
        actionLabel="Return home"
        description="The route exists neither in the current frontend stage plan nor in the active app tree."
        secondaryAction={
          <Button asChild variant="outline">
            <Link href="/profile">Open profile</Link>
          </Button>
        }
        title="Page not found"
      />
    </div>
  );
}
