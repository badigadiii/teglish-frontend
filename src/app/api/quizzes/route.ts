import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

export async function POST(request: Request) {
  try {
    return await proxyBackend("/quizzes", {
      method: "POST",
      data: await request.json(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
