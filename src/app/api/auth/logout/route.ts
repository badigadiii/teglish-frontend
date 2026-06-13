import { clearSessionToken } from "@/lib/session/cookies";

export async function POST() {
  await clearSessionToken();

  return Response.json({ ok: true });
}
