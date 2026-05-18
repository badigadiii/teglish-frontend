"use client";

import { Loader2Icon, UploadIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ApiErrorAlert } from "@/components/shared/api-error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/lib/api/media";
import type { MediaUploadResponse } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/errors/api-error";

type MediaUploadFieldProps = {
  value?: string;
  mediaUrl?: string;
  onUploaded: (media: MediaUploadResponse) => void;
  onClear?: () => void;
  fieldError?: string;
};

function validateSelectedFile(file: File) {
  if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
    return "Разрешены только audio/* и video/* файлы.";
  }

  if (!file.name.includes(".")) {
    return "Файл должен иметь расширение.";
  }

  return null;
}

export function MediaUploadField({
  value,
  mediaUrl,
  onUploaded,
  onClear,
  fieldError,
}: MediaUploadFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  function handleFileChange(file: File | null) {
    setUploadError(null);
    setSelectionError(null);
    setSelectedFile(null);

    if (!file) {
      return;
    }

    const validationError = validateSelectedFile(file);

    if (validationError) {
      setSelectionError(validationError);
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await uploadMedia(
        selectedFile,
        displayName.trim() || undefined,
      );

      onUploaded(response);
      setSelectedFile(null);
      setDisplayName("");
      setSelectionError(null);
      toast.success("Медиа загружено");
    } catch (error) {
      setUploadError(error);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-dashed p-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <Label htmlFor="media-file">Audio or video file</Label>
          <Input
            accept="audio/*,video/*"
            id="media-file"
            onChange={(event) =>
              handleFileChange(event.target.files?.item(0) ?? null)
            }
            type="file"
          />
          <p className="text-sm text-muted-foreground">
            Frontend blocks obvious non-media MIME types before upload.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="media-name">Display name</Label>
          <Input
            id="media-name"
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="lesson-clip"
            value={displayName}
          />
          <p className="text-sm text-muted-foreground">
            Optional. The backend normalizes the name and adds a UUID suffix.
          </p>
        </div>
      </div>

      {selectedFile ? (
        <p className="text-sm text-muted-foreground">
          Selected file:{" "}
          <span className="font-medium">{selectedFile.name}</span>
        </p>
      ) : null}

      {selectionError ? (
        <p className="text-sm font-medium text-destructive">{selectionError}</p>
      ) : null}

      {fieldError ? (
        <p className="text-sm font-medium text-destructive">{fieldError}</p>
      ) : null}

      {uploadError ? (
        <ApiErrorAlert error={uploadError} title="Media upload failed" />
      ) : null}

      {value && mediaUrl ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/50 p-3 text-sm">
          <span className="font-medium text-foreground">Current media:</span>
          <span className="text-muted-foreground">{value}</span>
          {onClear ? (
            <Button onClick={onClear} size="sm" type="button" variant="ghost">
              <XIcon />
              Clear
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          disabled={!selectedFile || isUploading || Boolean(selectionError)}
          onClick={handleUpload}
          type="button"
        >
          {isUploading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <UploadIcon />
          )}
          {isUploading ? "Uploading..." : "Upload media"}
        </Button>
        {selectedFile ? (
          <Button
            onClick={() => handleFileChange(null)}
            type="button"
            variant="outline"
          >
            Reset selection
          </Button>
        ) : null}
      </div>

      {(selectionError || uploadError || fieldError) && !value ? (
        <p className="text-sm text-muted-foreground">
          {getErrorMessage(
            uploadError,
            "Upload an audio/video file before submitting a dictation exercise.",
          )}
        </p>
      ) : null}
    </div>
  );
}
