import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[-0.01em] antialiased transition-all duration-200 active:scale-[0.97] cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
   {
      variants: {
         variant: {
            accent:
               "bg-accent-gradient text-white [color:#fff] [&_svg]:text-white [text-shadow:0_1px_0_rgba(0,0,0,0.18)] shadow-[0_4px_16px_var(--accent-glow),0_1px_0_rgba(255,255,255,0.28)_inset] hover:shadow-[0_8px_24px_var(--accent-glow),0_1px_0_rgba(255,255,255,0.28)_inset] hover:brightness-[1.06] hover:-translate-y-px",
            glass: "bg-inverse-surface text-inverse-text [color:var(--inverse-text)] border border-glass-border shadow-[var(--shadow-chip),0_1px_0_var(--edge)_inset] hover:bg-hover-surface hover:border-glass-border-strong hover:-translate-y-px hover:shadow-[var(--shadow-float)]",
            default:
               "bg-[var(--text-primary)] text-[var(--surface-0)] [color:var(--surface-0)] [&_svg]:text-[var(--surface-0)] hover:brightness-110 shadow-[0_4px_16px_rgba(15,15,20,0.14)] rounded-full",
            secondary:
               "bg-inverse-surface text-inverse-text [color:var(--inverse-text)] border border-glass-border hover:bg-hover-surface hover:border-glass-border-strong rounded-full shadow-[var(--shadow-chip)]",
            outline:
               "bg-inverse-surface text-inverse-text [color:var(--inverse-text)] border border-glass-border hover:bg-hover-surface hover:border-glass-border-strong rounded-full shadow-[var(--shadow-chip)] backdrop-blur-none",
            ghost: "text-inverse-text [color:var(--inverse-text)] hover:bg-hover-surface rounded-full",
            link: "text-accent underline-offset-4 hover:underline rounded-none shadow-none bg-transparent [color:var(--accent)]",
            destructive:
               "bg-destructive text-white [color:#fff] hover:bg-destructive/90 rounded-full shadow-sm",
         },
         size: {
            default: "h-10 px-5",
            sm: "h-9 px-4 text-[13px]",
            lg: "h-[42px] px-6 text-[14.5px] sm:h-[44px] sm:px-7",
            icon: "h-10 w-10",
         },
      },
      defaultVariants: {
         variant: "accent",
         size: "default",
      },
   },
);

export interface ButtonProps
   extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
   asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
   ({ className, variant, size, asChild = false, ...props }, ref) => {
      const Comp = asChild ? Slot : "button";
      return (
         <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
      );
   },
);
Button.displayName = "Button";

export { Button, buttonVariants };
