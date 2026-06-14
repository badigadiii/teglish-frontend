"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MediaRead } from "@/features/creator/types";
import { formatApiError } from "@/features/creator/utils";
import { MediaList } from "./resource-cards";

export function MediaUploadPanel({
  uploadPending,
  error,
  onUpload,
}: {
  uploadPending: boolean;
  error: unknown;
  onUpload: (file: File, name?: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const visibleError = localError ?? (error ? formatApiError(error) : null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setLocalError("Выберите аудио или видео файл");
      return;
    }

    if (
      file.type &&
      !(file.type.startsWith("audio/") || file.type.startsWith("video/"))
    ) {
      setLocalError("Поддерживаются только audio/* и video/*");
      return;
    }

    setLocalError(null);
    onUpload(file, name);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-4" />
          Загрузка медиа
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
          onSubmit={submit}
        >
          <div className="grid gap-2">
            <Label htmlFor="media-file">Файл</Label>
            <Input
              id="media-file"
              type="file"
              accept="audio/*,video/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="media-name">Имя</Label>
            <Input
              id="media-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="movie scene"
            />
          </div>
          <Button className="self-end" type="submit" disabled={uploadPending}>
            {uploadPending ? "Загрузка..." : "Загрузить"}
          </Button>
        </form>
        {visibleError && (
          <Alert className="mt-3" variant="destructive">
            <AlertDescription>{visibleError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export function MediaPanel({
  media,
  loading = false,
  uploadPending,
  deletePending,
  error,
  onUpload,
  onDelete,
}: {
  media: MediaRead[];
  loading?: boolean;
  uploadPending: boolean;
  deletePending: boolean;
  error: unknown;
  onUpload: (file: File, name?: string) => void;
  onDelete: (filename: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <MediaUploadPanel
        uploadPending={uploadPending}
        error={error}
        onUpload={onUpload}
      />
      <MediaList
        media={media}
        loading={loading}
        deletePending={deletePending}
        onDelete={onDelete}
      />
    </div>
  );
}
