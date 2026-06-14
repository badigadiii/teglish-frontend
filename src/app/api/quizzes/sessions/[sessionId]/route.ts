import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    return await proxyBackend(`/quizzes/sessions/${sessionId}`);
  } catch (error) {
    return handleRouteError(error);
  }
}
