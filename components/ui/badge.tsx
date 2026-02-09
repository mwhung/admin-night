import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-border/85 bg-surface-3/85 px-2.5 py-1 text-xs font-medium tracking-[0.02em] text-foreground/90 w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/25 aria-invalid:border-destructive transition-[color,background-color,border-color,box-shadow] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent shadow-[0_8px_18px_rgba(47,59,70,0.24)] [a&]:hover:bg-primary/92",
        secondary:
          "bg-secondary/92 text-secondary-foreground border-border/70 [a&]:hover:bg-secondary",
        destructive:
          "bg-destructive text-white border-transparent [a&]:hover:bg-destructive/92 focus-visible:ring-destructive/30",
        outline:
          "border-border bg-transparent text-foreground [a&]:hover:bg-surface-2",
        ghost: "bg-transparent border-transparent [a&]:hover:bg-surface-2 [a&]:hover:text-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
