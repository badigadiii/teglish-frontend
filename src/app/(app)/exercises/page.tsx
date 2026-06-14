import { ExerciseCatalog } from "@/features/student/catalog/exercise-catalog";

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const size = Math.min(100, Math.max(1, Number(params.size ?? 20) || 20));

  return <ExerciseCatalog page={page} size={size} />;
}
