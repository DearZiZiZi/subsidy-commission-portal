import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", disabled, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
          variant === "secondary" &&
            "bg-accent text-foreground hover:bg-border/40 dark:hover:bg-white/10",
          variant === "ghost" &&
            "bg-transparent text-foreground hover:bg-accent",
          variant === "outline" &&
            "border border-border bg-card text-foreground hover:bg-accent",
          variant === "destructive" &&
            "bg-[#FF3B30] text-white hover:bg-[#E6352B]",
          size === "sm" && "h-8 px-3 text-xs",
          size === "md" && "h-10 px-4 text-sm",
          size === "lg" && "min-h-12 px-5 py-3 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
