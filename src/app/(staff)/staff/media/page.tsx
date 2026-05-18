"use client";

import { CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MediaFilenameBadge } from "@/features/media/components/media-filename-badge";
import { MediaPreview } from "@/features/media/components/media-preview";
import { MediaUploadField } from "@/features/media/components/media-upload-field";
import type { MediaUploadResponse } from "@/lib/api/types";

export default function StaffMediaPage() {
  const [uploadedMedia, setUploadedMedia] =
    useState<MediaUploadResponse | null>(null);

  async function handleCopyFilename() {
    if (!uploadedMedia) {
      return;
    }

    await navigator.clipboard.writeText(uploadedMedia.media_filename);
    toast.success("Filename copied");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Staff"
        title="Media upload"
        description="Upload audio/video assets for dictation exercises. The backend does not expose a media list yet, so this MVP works with the last uploaded asset only."
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Upload media asset</CardTitle>
          <CardDescription>
            This screen sends multipart `POST /media` with the current bearer
            token.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <MediaUploadField
            mediaUrl={uploadedMedia?.media_url}
            onClear={() => setUploadedMedia(null)}
            onUploaded={(media) => setUploadedMedia(media)}
            value={uploadedMedia?.media_filename}
          />

          {uploadedMedia ? (
            <div className="space-y-4 rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Last uploaded filename:
                </span>
                <MediaFilenameBadge
                  mediaFilename={uploadedMedia.media_filename}
                />
                <Button
                  onClick={handleCopyFilename}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <CopyIcon />
                  Copy filename
                </Button>
              </div>

              <MediaPreview
                description="Use this filename in dictation exercise payloads until a backend media catalog exists."
                mediaFilename={uploadedMedia.media_filename}
                mediaUrl={uploadedMedia.media_url}
                title="Uploaded asset preview"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Backend limitation</AlertTitle>
        <AlertDescription>
          There is no `GET /media` catalog yet. Staff can upload and verify one
          asset here, then reuse the returned `media_filename` in dictation
          exercises.
        </AlertDescription>
      </Alert>
    </div>
  );
}
