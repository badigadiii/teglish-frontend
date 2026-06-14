import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    const { quizId } = await params;

    return await proxyBackend(`/quizzes/${quizId}/start`, {
      method: "POST",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
