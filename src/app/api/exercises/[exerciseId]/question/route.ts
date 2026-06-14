import { handleRouteError, proxyPublicBackend } from "@/lib/api/route-handlers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ exerciseId: string }> },
) {
  try {
    const { exerciseId } = await params;

    return await proxyPublicBackend(`/exercises/${exerciseId}/question`);
  } catch (error) {
    return handleRouteError(error);
  }
}
