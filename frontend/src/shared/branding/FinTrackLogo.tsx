import { motion } from 'framer-motion'

import { cn } from '@/shared/lib/utils'

interface FinTrackLogoProps {
  className?: string
  variant?: 'full' | 'icon' | 'stripes'
  animatedBars?: boolean
  transparentMark?: boolean
}

function LogoBars({
  className,
  animated = false,
}: {
  className?: string
  animated?: boolean
}) {
  const bars = [
    { heightClass: 'h-[42%]', colorClass: 'bg-[var(--forest-green)]', delay: 0 },
    { heightClass: 'h-[72%]', colorClass: 'bg-[var(--pale-yellow)]', delay: 0.12 },
    { heightClass: 'h-full', colorClass: 'bg-primary', delay: 0.24 },
  ]

  return (
    <div className={cn('relative flex h-[66%] w-[66%] items-end justify-center gap-[10%]', className)}>
      {bars.map(bar =>
        animated ? (
          <motion.span
            key={bar.delay}
            className={cn('w-[22%] rounded-full', bar.heightClass, bar.colorClass)}
            animate={{
              scaleY: [1, 1.18, 1],
              y: [0, -1.5, 0],
              opacity: [0.82, 1, 0.82],
            }}
            transition={{
              duration: 0.95,
              delay: bar.delay,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
          />
        ) : (
          <span key={bar.delay} className={cn('w-[22%] rounded-full', bar.heightClass, bar.colorClass)} />
        )
      )}
    </div>
  )
}

function LogoMark({
  className,
  animatedBars = false,
  transparentMark = false,
}: {
  className?: string
  animatedBars?: boolean
  transparentMark?: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex size-11 items-center justify-center overflow-hidden rounded-lg text-foreground',
        transparentMark
          ? 'border-transparent bg-transparent shadow-none'
          : 'border border-border bg-card shadow-[var(--shadow-level-1)]',
        className
      )}
    >
      <LogoBars animated={animatedBars} />
    </div>
  )
}

export function FinTrackLogo({
  className,
  variant = 'full',
  animatedBars = false,
  transparentMark = false,
}: FinTrackLogoProps) {
  if (variant === 'icon') {
    return (
      <LogoMark
        className={className}
        animatedBars={animatedBars}
        transparentMark={transparentMark}
      />
    )
  }

  if (variant === 'stripes') {
    return (
      <div className={cn('relative flex size-11 items-center justify-center', className)}>
        <LogoBars animated={animatedBars} />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark animatedBars={animatedBars} transparentMark={transparentMark} />
      <div className="space-y-0.5">
        <p className="text-lg font-semibold tracking-tight text-foreground">FinTrack</p>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Familia e planejamento
        </p>
      </div>
    </div>
  )
}
