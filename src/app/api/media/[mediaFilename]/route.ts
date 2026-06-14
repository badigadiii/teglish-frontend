import { backendClient } from "@/lib/api/backend-client";
import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

type Params = {
  params: Promise<{ mediaFilename: string }>;
};

const passthroughHeaders = [
  "accept-ranges",
  "cache-control",
  "content-disposition",
  "content-length",
  "content-range",
  "content-type",
] as const;

export async function GET(request: Request, { params }: Params) {
  try {
    const { mediaFilename } = await params;
    const range = request.headers.get("range");
    const response = await backendClient.get<ArrayBuffer>(
      `/media/${encodeURIComponent(mediaFilename)}`,
      {
        headers: range ? { Range: range } : undefined,
        responseType: "arraybuffer",
      },
    );
    const headers = new Headers();

    for (const header of passthroughHeaders) {
      const value = response.headers[header];

      if (typeof value === "string") {
        headers.set(header, value);
      }
    }

    return new Response(response.data, {
      headers,
      status: response.status,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { mediaFilename } = await params;

    return await proxyBackend(`/media/${encodeURIComponent(mediaFilename)}`, {
      method: "DELETE",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
