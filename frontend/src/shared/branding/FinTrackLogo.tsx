import { cn } from '@/shared/lib/utils'

interface FinTrackLogoProps {
  className?: string
  variant?: 'full' | 'icon'
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
      <div className="relative flex h-7 w-7 items-end justify-center gap-1">
        <span className="h-3 w-1.5 rounded-full bg-emerald-100/80" />
        <span className="h-5.5 w-1.5 rounded-full bg-emerald-50/95" />
        <span className="h-7 w-1.5 rounded-full bg-amber-200" />
      </div>
    </div>
  )
}

export function FinTrackLogo({ className, variant = 'full' }: FinTrackLogoProps) {
  if (variant === 'icon') {
    return <LogoMark className={className} />
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
