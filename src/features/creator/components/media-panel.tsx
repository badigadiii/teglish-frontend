"use client";

import { FileAudio, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteConfirmation } from "@/features/creator/components/delete-confirmation";
import type { MediaRead } from "@/features/creator/types";
import { formatApiError } from "@/features/creator/utils";

export function MediaPanel({
  media,
  uploadPending,
  deletePending,
  error,
  onUpload,
  onDelete,
}: {
  media: MediaRead[];
  uploadPending: boolean;
  deletePending: boolean;
  error: unknown;
  onUpload: (file: File, name?: string) => void;
  onDelete: (filename: string) => void;
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
    <div className="grid gap-4">
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

      <div className="grid gap-3">
        {media.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              Медиафайлов пока нет. Загрузите аудио или видео для диктанта.
            </CardContent>
          </Card>
        ) : (
          media.map((item) => (
            <Card key={item.media_filename}>
              <CardContent className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileAudio className="size-4 text-muted-foreground" />
                    <strong className="truncate">{item.media_filename}</strong>
                    <Badge variant="outline">{item.extension}</Badge>
                  </div>
                  <div className="mt-3">
                    {["mp4", "webm", "mov"].includes(
                      item.extension.toLowerCase(),
                    ) ? (
                      <video
                        className="max-h-32 w-full rounded-md border"
                        controls
                        src={item.media_url}
                      >
                        <track kind="captions" />
                      </video>
                    ) : (
                      <audio className="w-full" controls src={item.media_url}>
                        <track kind="captions" />
                      </audio>
                    )}
                  </div>
                </div>
                <DeleteConfirmation
                  title="Удалить медиафайл?"
                  description="Файл исчезнет из списка и больше не будет доступен для новых диктантов."
                  onConfirm={() => onDelete(item.media_filename)}
                >
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    disabled={deletePending}
                    aria-label="Удалить медиафайл"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </DeleteConfirmation>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
