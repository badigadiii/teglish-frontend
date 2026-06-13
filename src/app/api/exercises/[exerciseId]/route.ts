import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

type Params = {
  params: Promise<{ exerciseId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { exerciseId } = await params;

    return await proxyBackend(`/exercises/${exerciseId}`);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { exerciseId } = await params;

    return await proxyBackend(`/exercises/${exerciseId}`, {
      method: "PATCH",
      data: await request.json(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { exerciseId } = await params;

    return await proxyBackend(`/exercises/${exerciseId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
