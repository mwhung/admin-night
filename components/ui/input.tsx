import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/90 selection:bg-primary selection:text-primary-foreground border border-border/90 h-10 w-full min-w-0 rounded-[calc(var(--radius)-0.125rem)] bg-input/88 backdrop-blur-sm px-3.5 py-2 text-[0.95rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-[color,background-color,border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-white/80 focus-visible:ring-ring/35 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/25 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
