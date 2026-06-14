import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    const { quizId } = await params;
    const { search } = new URL(request.url);

    return await proxyBackend(
      `/users/me/quizzes/${quizId}/sessions/my${search}`,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
