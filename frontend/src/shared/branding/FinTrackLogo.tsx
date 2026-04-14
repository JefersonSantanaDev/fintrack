import { cn } from '@/shared/lib/utils'

interface FinTrackLogoProps {
  className?: string
  variant?: 'full' | 'icon' | 'stripes'
}

function LogoBars({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex h-7 w-7 items-end justify-center gap-1', className)}>
      <span className="h-3 w-1.5 rounded-full bg-[var(--forest-green)]" />
      <span className="h-5.5 w-1.5 rounded-full bg-[var(--pale-yellow)]" />
      <span className="h-7 w-1.5 rounded-full bg-primary" />
    </div>
  )
}

function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex size-11 items-center justify-center overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-[var(--shadow-level-1)]',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2 border-b border-[var(--charcoal-deep)] bg-primary/20" />
      <LogoBars />
    </div>
  )
}

export function FinTrackLogo({ className, variant = 'full' }: FinTrackLogoProps) {
  if (variant === 'icon') {
    return <LogoMark className={className} />
  }

  if (variant === 'stripes') {
    return (
      <div className={cn('relative flex size-11 items-center justify-center', className)}>
        <LogoBars />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark />
      <div className="space-y-0.5">
        <p className="text-lg font-semibold tracking-tight text-foreground">FinTrack</p>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Familia e planejamento
        </p>
      </div>
    </div>
  )
}
