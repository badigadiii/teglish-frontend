import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    return await proxyBackend(`/quizzes/sessions/${sessionId}/answer`, {
      method: "POST",
      data: await request.json(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
