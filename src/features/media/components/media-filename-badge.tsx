"use client";

import { Badge } from "@/components/ui/badge";

type MediaFilenameBadgeProps = {
  mediaFilename: string;
};

export function MediaFilenameBadge({ mediaFilename }: MediaFilenameBadgeProps) {
  return <Badge variant="secondary">{mediaFilename}</Badge>;
}
