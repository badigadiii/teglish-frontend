import { handleRouteError, proxyPublicBackend } from "@/lib/api/route-handlers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ exerciseId: string }> },
) {
  try {
    const { exerciseId } = await params;

    return await proxyPublicBackend(`/exercises/${exerciseId}/perform`, {
      method: "POST",
      data: await request.json(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
