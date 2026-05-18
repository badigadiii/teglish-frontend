import { PageHeader } from "@/components/layout/page-header";
import { ProfileOverview } from "@/features/users/components/profile-overview";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="This page is backed by `/users/me` and acts as the home base for route guards, role gates, and quick navigation."
      />
      <ProfileOverview />
    </div>
  );
}
