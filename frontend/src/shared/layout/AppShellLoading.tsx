import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

interface AppShellLoadingProps {
  className?: string
}

export function AppShellLoading({ className }: AppShellLoadingProps) {
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className={cn('space-y-4', className)}
    >
      <Card className="overflow-hidden border-border py-0">
        <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full max-w-[34rem]" />
              <Skeleton className="h-10 w-full max-w-[30rem]" />
              <Skeleton className="h-4 w-full max-w-[28rem]" />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-background p-4 shadow-[var(--shadow-level-1)]">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-10 w-52" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-11/12" />
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={`metric-skeleton-${index}`} className="rounded-lg bg-card">
            <CardContent className="space-y-3 px-6 py-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-8 w-full rounded-sm" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-lg bg-card">
          <CardContent className="space-y-6 px-6 py-6">
            <div className="space-y-2">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-72" />
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`budget-skeleton-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-lg bg-card">
            <CardContent className="space-y-4 px-6 py-6">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-64" />
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={`goal-skeleton-${index}`} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg bg-card">
            <CardContent className="space-y-4 px-6 py-6">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-56" />
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`family-skeleton-${index}`} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-52" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
