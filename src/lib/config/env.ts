const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export const env = {
  apiBaseUrl: normalizeUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  ),
};
