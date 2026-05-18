"use client";

import { FileAudioIcon, FileVideoIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { normalizeMediaUrl } from "@/lib/api/media";

type MediaPreviewProps = {
  mediaUrl?: string | null;
  mediaFilename?: string | null;
  title?: string;
  description?: string;
};

function isVideoFile(mediaFilename?: string | null) {
  return Boolean(mediaFilename?.match(/\.(mp4|webm|ogg|mov|m4v|avi)$/i));
}

export function MediaPreview({
  mediaUrl,
  mediaFilename,
  title = "Media preview",
  description = "The uploaded asset is served through the application proxy.",
}: MediaPreviewProps) {
  if (!mediaUrl) {
    return null;
  }

  const resolvedMediaUrl = normalizeMediaUrl(mediaUrl);
  const isVideo = isVideoFile(mediaFilename);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          {isVideo ? (
            <FileVideoIcon className="size-4 text-primary" />
          ) : (
            <FileAudioIcon className="size-4 text-primary" />
          )}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVideo ? (
          <video
            className="w-full rounded-xl border bg-black/80"
            controls
            preload="metadata"
            src={resolvedMediaUrl}
          >
            <track
              default
              kind="captions"
              label="Captions unavailable"
              src={"data:text/vtt,WEBVTT"}
            />
          </video>
        ) : (
          <audio
            className="w-full"
            controls
            preload="metadata"
            src={resolvedMediaUrl}
          >
            <track
              default
              kind="captions"
              label="Captions unavailable"
              src={"data:text/vtt,WEBVTT"}
            />
          </audio>
        )}
        {mediaFilename ? (
          <p className="text-sm text-muted-foreground">{mediaFilename}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
