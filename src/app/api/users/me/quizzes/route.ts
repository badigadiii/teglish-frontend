import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

export async function GET() {
  try {
    return await proxyBackend("/users/me/quizzes");
  } catch (error) {
    return handleRouteError(error);
  }
}
