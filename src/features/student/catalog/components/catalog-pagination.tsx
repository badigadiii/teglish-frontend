"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CatalogPagination({
  basePath,
  page,
  pages,
  size,
}: {
  basePath: string;
  page: number;
  pages: number;
  size: number;
}) {
  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(pages, page + 1);

  return (
    <div className="flex items-center justify-between gap-3">
      <Button asChild variant="outline" disabled={page <= 1}>
        <Link href={`${basePath}?page=${previousPage}&size=${size}`}>
          <ChevronLeft className="size-4" />
          Назад
        </Link>
      </Button>
      <span className="text-sm text-muted-foreground">
        Страница {page} из {Math.max(1, pages)}
      </span>
      <Button asChild variant="outline" disabled={page >= pages}>
        <Link href={`${basePath}?page=${nextPage}&size=${size}`}>
          Вперед
          <ChevronRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
