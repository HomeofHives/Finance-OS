import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@finance-os/ui";
import { useTheme } from "../../app/providers/use-theme";

interface ThemeToggleProps {
   className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
   const { theme, toggleTheme } = useTheme();
   const isDark = theme === "dark";

   return (
      <button
         type="button"
         onClick={toggleTheme}
         aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
         title={isDark ? "Switch to light mode" : "Switch to dark mode"}
         className={cn(
            "group relative grid h-9 w-9 place-items-center overflow-hidden rounded-full",
            "border border-glass-border bg-inverse-surface text-inverse-text",
            "shadow-[var(--shadow-chip)] backdrop-blur-xl",
            "transition-[transform,box-shadow,border-color,background-color] duration-300 ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
            "hover:-translate-y-px hover:border-glass-border-strong hover:shadow-[var(--shadow-float)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            "active:scale-95",
            className,
         )}
      >
         <span
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "var(--sheen)" }}
         />
         <span
            className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-md transition-colors duration-300 group-hover:bg-accent/30"
            aria-hidden="true"
         />

         <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
               <motion.span
                  key="moon"
                  className="relative grid place-items-center text-accent"
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
               >
                  <Moon size={15} fill="currentColor" strokeWidth={1.5} />
               </motion.span>
            ) : (
               <motion.span
                  key="sun"
                  className="relative grid place-items-center text-accent"
                  initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
               >
                  <Sun size={15} strokeWidth={2} />
               </motion.span>
            )}
         </AnimatePresence>
      </button>
   );
}
