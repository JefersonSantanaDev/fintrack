import { motion } from 'framer-motion'

import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { cn } from '@/shared/lib/utils'

interface FinTrackLoadingProps {
  className?: string
  fullScreen?: boolean
  showGrid?: boolean
}

export function FinTrackLoading({
  className,
  fullScreen = true,
  showGrid = true,
}: FinTrackLoadingProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-background text-foreground',
        fullScreen ? 'flex min-h-screen items-center justify-center px-4' : '',
        className
      )}
    >
      {showGrid ? <div className="absolute inset-0 bg-grid-pattern opacity-55" /> : null}
      <div className="relative z-10 flex flex-col items-center gap-0">
        <FinTrackLogo
          variant="icon"
          animatedBars
          transparentMark
          className="size-24"
        />
        <div className="-mt-2 flex items-center text-sm font-medium text-muted-foreground">
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          >
            Carregando
          </motion.span>
        </div>
      </div>
    </div>
  )
}
