import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border text-sm font-semibold transition-[background-color,color,border-color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/60 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-level-1)] hover:border-[var(--pale-yellow)] hover:bg-[var(--pressed-black)] hover:text-primary active:text-[var(--pale-yellow)]",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground shadow-[var(--shadow-level-1)] hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border-[var(--border-olive)] bg-transparent text-foreground shadow-[var(--shadow-level-1)] hover:bg-accent hover:text-foreground active:text-[var(--pale-yellow)]",
        secondary:
          "border-[var(--forest-dark)] bg-secondary text-secondary-foreground shadow-[var(--shadow-level-1)] hover:bg-[var(--forest-dark)] active:text-[var(--pale-yellow)]",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-accent hover:text-foreground active:text-[var(--pale-yellow)]",
        link:
          "border-transparent bg-transparent px-0 text-foreground underline-offset-4 hover:text-primary hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-4",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
