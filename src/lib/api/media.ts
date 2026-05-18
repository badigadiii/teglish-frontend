import { apiRequest, buildAppApiPath, resolveApiUrl } from "@/lib/api/http";
import type { MediaUploadResponse } from "@/lib/api/types";

export function uploadMedia(file: File, name?: string) {
  const body = new FormData();
  body.set("file", file);

  if (name) {
    body.set("name", name);
  }

  return apiRequest<MediaUploadResponse>({
    path: "/media",
    method: "POST",
    body,
  });
}

export function getMediaUrl(mediaFilename: string) {
  return buildAppApiPath(`/media/${encodeURIComponent(mediaFilename)}`);
}

export function normalizeMediaUrl(pathOrUrl: string) {
  return resolveApiUrl(pathOrUrl);
}
