import { handleRouteError, proxyPublicBackend } from "@/lib/api/route-handlers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    const { quizId } = await params;

    return await proxyPublicBackend(`/quizzes/public/${quizId}`);
  } catch (error) {
    return handleRouteError(error);
  }
}
