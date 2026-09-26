import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "primary-outline" | "secondary" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-70",
          variant === "primary" && "bg-accent text-background hover:scale-105",
          variant === "primary-outline" && "bg-accent text-background border border-accent hover:bg-transparent hover:text-accent",
          variant === "secondary" && "bg-surface-interactive text-foreground hover:bg-surface-elevated",
          variant === "outline" && "border border-border bg-transparent hover:bg-surface-interactive hover:scale-105 text-foreground",
          variant === "ghost" && "hover:bg-surface-interactive hover:text-foreground text-foreground-secondary",
          size === "default" && "h-10 px-6 py-2",
          size === "sm" && "h-9 rounded-md px-3",
          size === "lg" && "h-12 rounded-md px-8 py-3 text-base font-semibold",
          size === "icon" && "h-10 w-10",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
