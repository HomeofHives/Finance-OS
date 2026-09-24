import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface FadeInProps {
   children: ReactNode;
   className?: string;
   delay?: number;
   y?: number;
   duration?: number;
}

// Mount animation for above-the-fold content where whileInView is redundant.
export function FadeIn({ children, className, delay = 0, y = 14, duration = 0.6 }: FadeInProps) {
   const prefersReducedMotion = useReducedMotion();
   if (prefersReducedMotion) return <div className={className}>{children}</div>;
   return (
      <motion.div
         className={className}
         initial={{ opacity: 0, y, scale: 0.992, filter: "blur(6px)" }}
         animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
         transition={{ duration, delay, ease: EASE }}
      >
         {children}
      </motion.div>
   );
}
