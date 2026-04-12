import { cn } from '@/shared/lib/utils'

interface FinTrackLogoProps {
  className?: string
  variant?: 'full' | 'icon' | 'stripes'
}

function LogoBars({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex h-7 w-7 items-end justify-center gap-1', className)}>
      <span className="h-3 w-1.5 rounded-full bg-emerald-500/80" />
      <span className="h-5.5 w-1.5 rounded-full bg-emerald-500" />
      <span className="h-7 w-1.5 rounded-full bg-amber-300" />
    </div>
  )
}

function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex size-11 items-center justify-center overflow-hidden rounded-[18px] bg-linear-to-br from-emerald-400 via-emerald-500 to-teal-700 text-white shadow-[0_14px_28px_-16px_rgba(16,185,129,0.8)]',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/15 via-transparent to-black/10" />
      <LogoBars className="[&_span:nth-child(1)]:bg-emerald-100/80 [&_span:nth-child(2)]:bg-emerald-50/95 [&_span:nth-child(3)]:bg-amber-200" />
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
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Familia e planejamento
        </p>
      </div>
    </div>
  )
}
