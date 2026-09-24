import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
   children: ReactNode;
   className?: string;
   delay?: number;
}

// Signature fluid ease — soft expo-out, no bounce.
const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({ children, className, delay = 0 }: RevealProps) {
   const prefersReducedMotion = useReducedMotion();
   return (
      <motion.div
         className={className}
         initial={
            prefersReducedMotion ? false : { opacity: 0, y: 26, scale: 0.985, filter: "blur(8px)" }
         }
         whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
         }
         viewport={{ once: true, amount: 0.18 }}
         transition={{
            duration: prefersReducedMotion ? 0 : 0.72,
            delay,
            ease: prefersReducedMotion ? "easeOut" : EASE,
         }}
      >
         {children}
      </motion.div>
   );
}
