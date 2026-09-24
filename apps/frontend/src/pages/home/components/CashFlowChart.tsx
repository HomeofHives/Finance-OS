import { motion, useReducedMotion } from "framer-motion";

const LINE =
   "M0 145 C65 130 75 150 130 118 S205 130 250 95 S325 115 370 74 S445 92 490 57 S590 65 700 25";

export function CashFlowChart() {
   const prefersReducedMotion = useReducedMotion();

   const area = prefersReducedMotion
      ? { initial: false as const }
      : {
           initial: { opacity: 0 } as const,
           whileInView: { opacity: 1 } as const,
           viewport: { once: true as const, amount: 0.4 as const },
           transition: { duration: 1, delay: 0.55, ease: "easeOut" as const },
        };
   const line = prefersReducedMotion
      ? { initial: false as const }
      : {
           initial: { pathLength: 0 } as const,
           whileInView: { pathLength: 1 } as const,
           viewport: { once: true as const, amount: 0.4 as const },
           transition: { duration: 1.7, ease: [0.65, 0, 0.35, 1] as const },
        };
   const dot = prefersReducedMotion
      ? { initial: false as const }
      : {
           initial: { opacity: 0, scale: 0 } as const,
           whileInView: { opacity: 1, scale: 1 } as const,
           viewport: { once: true as const, amount: 0.4 as const },
           transition: { type: "spring" as const, stiffness: 260, damping: 18, delay: 1.5 },
        };

   return (
      <div className="mt-5 w-full overflow-hidden rounded-2xl border border-glass-border bg-glass-bg p-3 backdrop-blur-sm shadow-[var(--shadow-chip)]">
         <svg
            className="block h-[160px] w-full overflow-visible"
            viewBox="0 0 700 180"
            role="img"
            aria-label="Cash flow rising over six months"
         >
            <defs>
               <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
               </linearGradient>
               <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6d28d9" />
               </linearGradient>
               <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                     <feMergeNode in="coloredBlur" />
                     <feMergeNode in="SourceGraphic" />
                  </feMerge>
               </filter>
            </defs>
            <g opacity="0.06">
               <line x1="0" y1="36" x2="700" y2="36" stroke="currentColor" strokeWidth="1" />
               <line x1="0" y1="72" x2="700" y2="72" stroke="currentColor" strokeWidth="1" />
               <line x1="0" y1="108" x2="700" y2="108" stroke="currentColor" strokeWidth="1" />
               <line x1="0" y1="144" x2="700" y2="144" stroke="currentColor" strokeWidth="1" />
            </g>
            <motion.path className="fill-[url(#chartGradient)]" d={`${LINE} V180 H0Z`} {...area} />
            <motion.path
               className="fill-none stroke-[url(#lineGradient)] [stroke-width:3] [stroke-linecap:round] [stroke-linejoin:round]"
               d={LINE}
               filter="url(#glow)"
               {...line}
            />
            <motion.g {...dot}>
               <circle
                  className="fill-glass-bg stroke-accent [stroke-width:2.5] [transform-box:fill-box] [transform-origin:center]"
                  cx="700"
                  cy="25"
                  r="7"
               />
               <circle
                  className="fill-accent [transform-box:fill-box] [transform-origin:center]"
                  cx="700"
                  cy="25"
                  r="3"
               />
            </motion.g>
         </svg>
         <div className="mt-2 flex justify-between text-[11px] font-medium tracking-wide text-text-muted">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
         </div>
      </div>
   );
}
