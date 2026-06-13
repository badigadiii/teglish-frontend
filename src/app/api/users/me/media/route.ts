import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

export async function GET(request: Request) {
  try {
    const { search } = new URL(request.url);

    return await proxyBackend(`/users/me/media${search}`);
  } catch (error) {
    return handleRouteError(error);
  }
}
