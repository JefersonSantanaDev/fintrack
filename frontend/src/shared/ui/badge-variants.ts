import { cva, type VariantProps } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border px-2 py-0.5 text-xs font-semibold whitespace-nowrap [&>svg]:size-3 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow]",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground [a&]:hover:border-[var(--pale-yellow)] [a&]:hover:bg-[var(--pressed-black)] [a&]:hover:text-primary",
        secondary:
          "border-[var(--forest-dark)] bg-secondary text-secondary-foreground [a&]:hover:bg-[var(--forest-dark)]",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline: "border-[var(--border-olive)] text-foreground [a&]:hover:bg-accent",
        success:
          "border-success/55 bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning:
          "border-warning/70 bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        info:
          "border-[var(--charcoal)] bg-muted text-muted-foreground [a&]:hover:bg-accent [a&]:hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
