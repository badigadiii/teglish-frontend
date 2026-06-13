import { requestCurrentUser } from "@/features/auth/server";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { getSessionToken } from "@/lib/session/cookies";

export default async function ProfileMediaPage() {
  const token = await getSessionToken();
  const user = await requestCurrentUser(token ?? "");

  return <ProfilePage user={user} section="media" />;
}
