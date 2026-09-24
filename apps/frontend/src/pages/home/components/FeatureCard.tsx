import type { LucideIcon } from "lucide-react";
import { cn } from "@finance-os/ui";

interface FeatureCardProps {
   icon?: LucideIcon;
   number?: string;
   title: string;
   description: string;
   variant?: "card" | "row";
   className?: string;
}

export function FeatureCard({
   icon: Icon,
   number,
   title,
   description,
   variant = "card",
   className,
}: FeatureCardProps) {
   if (variant === "row") {
      return (
         <div
            className={cn(
               "group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-glass-border bg-glass-bg p-5 backdrop-blur-xl will-change-transform transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] hover:-translate-y-0.5 hover:bg-glass-bg-strong hover:shadow-[var(--shadow-float)] hover:border-glass-border-strong",
               "shadow-[var(--shadow-panel)]",
               className,
            )}
         >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[var(--sheen)]" />
            {Icon ? (
               <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-soft text-white shadow-[0_4px_12px_var(--accent-glow)]">
                  <Icon size={19} />
               </span>
            ) : null}
            <div className="relative">
               <h3 className="text-[14px] font-semibold tracking-tight text-text-primary">
                  {title}
               </h3>
               <p className="mt-1 text-[13.5px] leading-relaxed text-text-secondary">
                  {description}
               </p>
            </div>
         </div>
      );
   }

   return (
      <div
         className={cn(
            "group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-glass-bg-strong hover:shadow-[var(--shadow-float)] hover:border-glass-border-strong",
            "shadow-[var(--shadow-panel)]",
            className,
         )}
      >
         <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[var(--sheen)]" />
         <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[var(--gradient-card-shine)]" />

         <div className="relative mb-5 flex items-center justify-between">
            {Icon ? (
               <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-soft text-white shadow-[0_4px_16px_var(--accent-glow)] ring-1 ring-white/30">
                  <Icon size={20} />
               </span>
            ) : (
               <span className="grid h-10 w-10 place-items-center rounded-xl border border-glass-border bg-inverse-surface font-mono text-xs font-bold tracking-widest text-accent shadow-[var(--shadow-chip)] backdrop-blur-sm">
                  {number}
               </span>
            )}
            {Icon && number ? (
               <span className="rounded-lg border border-accent/15 bg-accent-bg px-2 py-1 font-mono text-[11px] font-bold tracking-[0.18em] text-accent shadow-[var(--shadow-chip)]">
                  {number}
               </span>
            ) : null}
         </div>

         <h3 className="card-title relative">{title}</h3>
         <p className="relative mt-2 text-[13.8px] leading-relaxed text-text-secondary">
            {description}
         </p>

         <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
   );
}
