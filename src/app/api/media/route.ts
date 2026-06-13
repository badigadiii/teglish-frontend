import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

export async function POST(request: Request) {
  try {
    return await proxyBackend("/media", {
      method: "POST",
      data: await request.formData(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
