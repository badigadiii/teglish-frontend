import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
};

export function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <Link
      className={cn("inline-flex items-center gap-3", className)}
      href="/"
      prefetch={false}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-sm">
        Tg
      </span>
      {!compact ? (
        <span className="flex flex-col">
          <span className="font-heading text-lg font-semibold tracking-tight">
            Teglish
          </span>
          <span className="text-sm text-muted-foreground">
            Practice, author, and review English exercises.
          </span>
        </span>
      ) : null}
    </Link>
  );
}
