import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </CardContent>
    </Card>
  );
}
