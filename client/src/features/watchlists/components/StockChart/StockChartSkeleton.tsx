import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder layout shown while chart history is loading or refetching. */
function StockChartSkeleton() {
  return (
    <div
      className="flex h-full min-h-[16rem] w-full flex-col gap-3 p-4"
      aria-hidden="true"
      data-testid="stock-chart-skeleton"
    >
      <div className="flex items-end justify-between gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="min-h-[12rem] flex-1 rounded-lg" />
      <div className="flex justify-between gap-2">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  )
}

export default StockChartSkeleton
