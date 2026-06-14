import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    return await proxyBackend(`/quizzes/sessions/${sessionId}/finish`, {
      method: "POST",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
