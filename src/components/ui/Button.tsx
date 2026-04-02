import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
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
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-gold-500 text-navy-950 hover:bg-gold-400 dark:text-navy-950",
          variant === "secondary" &&
            "bg-navy-700 text-white hover:bg-navy-600 dark:bg-navy-800",
          variant === "ghost" &&
            "bg-transparent hover:bg-black/5 dark:hover:bg-white/10",
          variant === "outline" &&
            "border border-gold-500/50 bg-transparent text-foreground hover:bg-gold-500/10",
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
