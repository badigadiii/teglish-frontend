import { handleRouteError, proxyPublicBackend } from "@/lib/api/route-handlers";

export async function GET(request: Request) {
  try {
    const { search } = new URL(request.url);

    return await proxyPublicBackend(`/quizzes/public${search}`);
  } catch (error) {
    return handleRouteError(error);
  }
}
