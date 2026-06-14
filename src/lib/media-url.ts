type MediaUrlSource = {
  media_filename?: string;
  media_url?: string;
};

export function mediaApiUrl(mediaFilename: string) {
  return `/api/media/${encodeURIComponent(mediaFilename)}`;
}

export function mediaPlaybackUrl(source: MediaUrlSource | string) {
  if (typeof source !== "string" && source.media_filename) {
    return mediaApiUrl(source.media_filename);
  }

  const mediaUrl = typeof source === "string" ? source : source.media_url;

  if (!mediaUrl) {
    return "";
  }

  const mediaPath = mediaPathFromUrl(mediaUrl);

  if (!mediaPath) {
    return mediaUrl;
  }

  return mediaApiUrl(mediaPath);
}

function mediaPathFromUrl(mediaUrl: string) {
  if (mediaUrl.startsWith("/api/media/")) {
    return decodeMediaFilename(mediaUrl.slice("/api/media/".length));
  }

  if (mediaUrl.startsWith("/media/")) {
    return decodeMediaFilename(mediaUrl.slice("/media/".length));
  }

  try {
    const url = new URL(mediaUrl);

    if (url.pathname.startsWith("/api/media/")) {
      return decodeMediaFilename(url.pathname.slice("/api/media/".length));
    }

    if (url.pathname.startsWith("/media/")) {
      return decodeMediaFilename(url.pathname.slice("/media/".length));
    }
  } catch {
    return null;
  }

  return null;
}

function decodeMediaFilename(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
