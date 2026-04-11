import { cn } from '@/shared/lib/utils'

interface FinTrackLogoProps {
  className?: string
}

export function FinTrackLogo({ className }: FinTrackLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/30 bg-linear-to-br from-emerald-400 via-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20">
        <div className="relative flex items-end gap-1">
          <span className="h-3 w-1.5 rounded-full bg-white/70" />
          <span className="h-5 w-1.5 rounded-full bg-white/90" />
          <span className="h-7 w-1.5 rounded-full bg-amber-200" />
        </div>
      </div>
      <div className="space-y-0.5">
        <p className="text-lg font-semibold tracking-tight text-foreground">FinTrack</p>
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Familia e planejamento
        </p>
      </div>
    </div>
  )
}
