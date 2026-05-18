import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

export function LoadingState({
  label = "Loading content",
  fullScreen = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex w-full justify-center",
        fullScreen && "min-h-[50vh] items-center",
        className,
      )}
    >
      <Card className="w-full max-w-2xl shadow-sm">
        <CardHeader className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-full" />
          <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </div>
  );
}
