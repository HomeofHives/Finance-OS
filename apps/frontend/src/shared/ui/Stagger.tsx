import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface StaggerProps {
   children: ReactNode;
   className?: string;
   delay?: number;
}

interface StaggerItemProps {
   children: ReactNode;
   className?: string;
}

export function Stagger({ children, className, delay = 0 }: StaggerProps) {
   const prefersReducedMotion = useReducedMotion();
   if (prefersReducedMotion) {
      return <div className={className}>{children}</div>;
   }
   return (
      <motion.div
         className={className}
         initial="hidden"
         whileInView="show"
         viewport={{ once: true, amount: 0.15 }}
         variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.09, delayChildren: delay } },
         }}
      >
         {children}
      </motion.div>
   );
}

export function StaggerItem({ children, className }: StaggerItemProps) {
   const prefersReducedMotion = useReducedMotion();
   if (prefersReducedMotion) {
      return <div className={className}>{children}</div>;
   }
   return (
      <motion.div
         className={className}
         variants={{
            hidden: { opacity: 0, y: 24, scale: 0.98, filter: "blur(6px)" },
            show: {
               opacity: 1,
               y: 0,
               scale: 1,
               filter: "blur(0px)",
               transition: { duration: 0.62, ease: EASE },
            },
         }}
      >
         {children}
      </motion.div>
   );
}
