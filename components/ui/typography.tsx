import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva("leading-relaxed", {
    variants: {
        variant: {
            h1: "scroll-m-20 text-3xl font-extralight tracking-tight lg:text-4xl",
            h2: "scroll-m-20 text-2xl font-light tracking-tight transition-colors first:mt-0",
            h3: "scroll-m-20 text-xl font-light tracking-tight",
            h4: "scroll-m-20 text-lg font-medium tracking-tight",
            p: "leading-7 [&:not(:first-child)]:mt-6 font-light",
            blockquote: "mt-6 border-l-2 pl-6 italic font-light text-muted-foreground",
            list: "my-6 ml-6 list-disc [&>li]:mt-2 font-light",
            inlineCode: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
            lead: "text-lg text-muted-foreground font-light leading-relaxed",
            large: "text-lg font-medium",
            small: "text-sm font-medium leading-none",
            muted: "text-sm text-muted-foreground font-light",
        },
        affinity: {
            default: "",
            healing: "text-foreground/90 font-extralight tracking-tight",
            therapeutic: "text-primary/80 font-light tracking-wide",
        },
    },
    defaultVariants: {
        variant: "p",
        affinity: "default",
    },
})

export interface TypographyProps
    extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
    as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "blockquote" | "code"
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, variant, affinity, as, ...props }, ref) => {
        const Component = as || (variant?.startsWith("h") ? (variant as any) : variant === "inlineCode" ? "code" : "p")

        return (
            <Component
                className={cn(typographyVariants({ variant, affinity, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Typography.displayName = "Typography"

export { Typography, typographyVariants }
