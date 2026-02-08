import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[calc(var(--radius)-0.125rem)] text-sm font-medium tracking-[0.005em] transition-[background-color,color,border-color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/25 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(47,59,70,0.28)] hover:bg-primary/92 hover:-translate-y-px",
        destructive:
          "bg-destructive text-white shadow-[0_8px_18px_rgba(166,56,66,0.24)] hover:bg-destructive/92 hover:-translate-y-px focus-visible:ring-destructive/30",
        success:
          "bg-success text-success-foreground shadow-[0_10px_24px_rgba(77,143,121,0.24)] hover:bg-success/92 hover:-translate-y-px focus-visible:ring-success/30",
        outline:
          "border border-border/90 bg-surface-3 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] hover:bg-surface-elevated hover:border-white/80",
        secondary:
          "bg-secondary/86 text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] hover:bg-secondary",
        ghost:
          "hover:bg-surface-2 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-[calc(var(--radius)-0.25rem)] gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-[calc(var(--radius)+0.125rem)] px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-xs": "size-7 rounded-[calc(var(--radius)-0.25rem)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
