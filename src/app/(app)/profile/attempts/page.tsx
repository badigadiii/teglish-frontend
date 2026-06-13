import { requestCurrentUser } from "@/features/auth/server";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { getSessionToken } from "@/lib/session/cookies";

export default async function ProfileAttemptsPage() {
  const token = await getSessionToken();
  const user = await requestCurrentUser(token ?? "");

  return <ProfilePage user={user} section="attempts" />;
}
