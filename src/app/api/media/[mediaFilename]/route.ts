import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

type Params = {
  params: Promise<{ mediaFilename: string }>;
};

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
