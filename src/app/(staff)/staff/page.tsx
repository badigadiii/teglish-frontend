import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function StaffDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Staff"
        title="Staff dashboard"
        description="This shell is only visible to `admin` and `moderator`. Later stages attach moderation lists, media workflows, and staff review flows here."
      />
      <EmptyState
        actionHref="/staff/exercises"
        actionLabel="Open staff exercises route"
        description="The separation between learner navigation and staff navigation is already in place so later stages can layer data workflows onto a stable shell."
        title="Staff overview is scaffolded"
      />
    </div>
  );
}
