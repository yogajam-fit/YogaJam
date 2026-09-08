import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({ title, subtitle, className, align = "center", as: Component = "h2" }: SectionHeadingProps) {
  const sizeClasses = {
    h1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
    h2: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
    h3: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
  };

  return (
    <div className={cn(
      "flex flex-col gap-3",
      align === "left" && "text-left",
      align === "center" && "text-center items-center",
      align === "right" && "text-right items-end",
      className
    )}>
      <Component className={cn(
        sizeClasses[Component],
        "font-heading font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-accent-warm leading-tight pb-1"
      )}>
        {title}
      </Component>
      {subtitle && (
        <p className="text-foreground-secondary text-base md:text-lg max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
