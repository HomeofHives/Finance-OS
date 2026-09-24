import type { ReactNode } from "react";
import { cn } from "@finance-os/ui";

interface AppWindowProps {
   url?: string;
   barRight?: ReactNode;
   children: ReactNode;
   className?: string;
}

export function AppWindow({ url, barRight, children, className }: AppWindowProps) {
   return (
      <div
         className={cn(
            "relative overflow-hidden rounded-[20px] border border-glass-border bg-glass-bg backdrop-blur-2xl will-change-transform",
            "shadow-[var(--shadow-panel-lg)]",
            "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] hover:-translate-y-1 hover:shadow-[var(--glass-shadow-floating)]",
            className,
         )}
      >
         <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--edge)] to-transparent" />
         <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[var(--sheen)]" />

         <div className="relative flex h-[52px] items-center justify-between gap-3 border-b border-glass-border bg-glass-bg-subtle px-5 backdrop-blur-xl">
            <div className="flex items-center gap-1.5">
               <span className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)_inset]" />
               <span className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)_inset]" />
               <span className="h-3 w-3 rounded-full bg-[#27c93f] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)_inset]" />
            </div>

            {url ? (
               <span className="hidden sm:inline-flex items-center gap-1.5 truncate rounded-full border border-glass-border bg-glass-bg px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-tight text-text-secondary backdrop-blur-md shadow-[var(--shadow-chip)]">
                  <span className="h-2 w-2 rounded-full bg-[#27c93f] shadow-[0_0_6px_rgba(39,201,63,0.5)]" />
                  {url}
               </span>
            ) : (
               <span />
            )}

            {/* mobile URL centered fallback */}
            {url ? (
               <span className="sm:hidden truncate rounded-full border border-glass-border bg-glass-bg px-3 py-1 font-mono text-[10px] text-text-secondary">
                  {url}
               </span>
            ) : null}

            <div className="flex items-center shrink-0">{barRight}</div>
         </div>

         <div className="relative bg-gradient-to-b from-glass-bg-subtle to-transparent">
            {children}
         </div>
      </div>
   );
}
