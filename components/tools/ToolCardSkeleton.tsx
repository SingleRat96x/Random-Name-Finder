import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ToolCardSkeleton() {
  return (
    <Card className="h-full flex flex-col animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Icon skeleton */}
            <div className="flex-shrink-0 p-2 bg-muted rounded-lg">
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              {/* Title skeleton */}
              <Skeleton className="h-6 w-3/4 mb-1" />
            </div>
          </div>
          {/* Category badge skeleton */}
          <Skeleton className="h-5 w-16 shrink-0 ml-2" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Description skeleton - 3 lines */}
        <div className="space-y-2 mb-4 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="flex items-center justify-between w-full">
          {/* "View Tool" link skeleton */}
          <Skeleton className="h-4 w-16" />
          
          {/* Button skeleton */}
          <Skeleton className="h-9 w-32" />
        </div>
      </CardFooter>
    </Card>
  );
} 