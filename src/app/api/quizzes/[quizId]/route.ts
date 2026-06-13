import { handleRouteError, proxyBackend } from "@/lib/api/route-handlers";

type Params = {
  params: Promise<{ quizId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { quizId } = await params;

    return await proxyBackend(`/quizzes/${quizId}`);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { quizId } = await params;

    return await proxyBackend(`/quizzes/${quizId}`, {
      method: "PATCH",
      data: await request.json(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { quizId } = await params;

    return await proxyBackend(`/quizzes/${quizId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
