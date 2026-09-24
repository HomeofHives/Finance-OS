import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import { Button } from "@finance-os/ui";
import { GithubIcon } from "./BrandIcons";
import { ThemeToggle } from "../../../shared/ui/ThemeToggle";
import { navigationLinks } from "../data/home-content";

const linkClass =
   "relative rounded-full px-4 py-1.5 text-[14px] font-semibold tracking-tight text-text-secondary transition-[color,background-color] duration-300 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent after:absolute after:inset-x-3 after:bottom-[4px] after:h-[2.5px] after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-accent after:to-accent-soft after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.21,0.47,0.32,0.98)] hover:after:scale-x-100";

export function Logo() {
   return (
      <a
         className="group inline-flex items-center gap-2.5 text-[15px] font-extrabold tracking-[-0.03em] text-text-primary"
         href="#top"
         aria-label="Finance-OS home"
      >
         <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-gradient text-white shadow-[0_4px_12px_var(--accent-glow)] ring-1 ring-white/30 transition-transform duration-200 group-hover:scale-105">
            <Sparkles size={13} />
         </span>
         <span>
            Finance<span className="text-gradient">-OS</span>
         </span>
      </a>
   );
}

export function Navbar() {
   const [menuOpen, setMenuOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const prefersReducedMotion = useReducedMotion();

   useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
   }, []);

   const closeMenu = () => setMenuOpen(false);

   const menuMotion = prefersReducedMotion
      ? { initial: false as const }
      : {
           initial: { opacity: 0, y: -6 },
           animate: { opacity: 1, y: 0 },
           exit: { opacity: 0, y: -4 },
           transition: { duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] as const },
        };

   return (
      <header className="sticky top-0 z-50">
         {/* attached bar — full-width, flush with the top like a real SaaS nav */}
         <div
            className={`border-b transition-all duration-300 will-change-[background-color,border-color,box-shadow] ${
               scrolled
                  ? "border-border bg-glass-bg-heavy shadow-[var(--shadow-nav)]"
                  : "border-transparent bg-glass-bg-subtle"
            }`}
            style={{
               backdropFilter: prefersReducedMotion ? "" : "blur(18px) saturate(1.4)",
               WebkitBackdropFilter: prefersReducedMotion ? "" : "blur(18px) saturate(1.4)",
            }}
         >
            <nav
               className="container-page grid h-[58px] grid-cols-[1fr_auto_1fr] items-center gap-4"
               aria-label="Main navigation"
            >
               <div className="flex justify-self-start">
                  <Logo />
               </div>

               <div className="hidden items-center gap-0.5 lg:flex">
                  <a className={linkClass} href="#top">
                     Home
                  </a>
                  {navigationLinks.map((item) => (
                     <a className={linkClass} key={item} href={`#${item.toLowerCase()}`}>
                        {item}
                     </a>
                  ))}
               </div>

               <div className="flex items-center justify-self-end gap-2">
                  <ThemeToggle />

                  <a
                     className="hidden h-9 items-center gap-2 rounded-full border border-glass-border bg-inverse-surface px-4 text-[13px] font-semibold tracking-tight text-inverse-text shadow-[var(--shadow-chip)] transition-all duration-200 hover:bg-hover-surface hover:border-glass-border-strong hover:-translate-y-px md:inline-flex"
                     href="https://github.com/HomeofHives/Finance-OS"
                     target="_blank"
                     rel="noreferrer"
                     aria-label="Star Finance-OS on GitHub"
                  >
                     <GithubIcon className="h-[15px] w-[15px]" />
                     Star
                  </a>
                  <span className="hidden h-5 w-px bg-border md:block" />
                  <a
                     className="hidden h-9 items-center rounded-full px-4 text-[13px] font-semibold tracking-tight text-text-secondary transition-colors duration-200 hover:text-text-primary md:inline-flex"
                     href="#get-started"
                  >
                     Sign in
                  </a>
                  <Button asChild size="sm" variant="accent">
                     <a href="#get-started">
                        Get Started <ArrowRight size={15} className="text-white" />
                     </a>
                  </Button>

                  <button
                     className="grid h-9 w-9 place-items-center rounded-full border border-glass-border bg-inverse-surface text-inverse-text shadow-[var(--shadow-chip)] transition-all duration-150 hover:bg-hover-surface active:scale-[0.96] lg:hidden"
                     type="button"
                     aria-label={menuOpen ? "Close menu" : "Open menu"}
                     aria-expanded={menuOpen}
                     onClick={() => setMenuOpen(!menuOpen)}
                  >
                     {menuOpen ? <X size={17} /> : <Menu size={17} />}
                  </button>
               </div>
            </nav>
         </div>

         <AnimatePresence>
            {menuOpen && (
               <motion.div
                  key="mobile-menu"
                  className="absolute inset-x-0 border-b border-border bg-glass-bg-heavy shadow-[var(--shadow-panel-lg)] backdrop-blur-2xl lg:hidden"
                  style={{ backdropFilter: "blur(24px) saturate(1.4)" }}
                  {...menuMotion}
               >
                  <nav className="container-page grid gap-1 py-4">
                     <a
                        className="rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight text-text-primary hover:bg-hover-surface"
                        href="#top"
                        onClick={closeMenu}
                     >
                        Home
                     </a>
                     {navigationLinks.map((item) => (
                        <a
                           className="rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight text-text-secondary hover:bg-hover-surface hover:text-text-primary"
                           key={item}
                           href={`#${item.toLowerCase()}`}
                           onClick={closeMenu}
                        >
                           {item}
                        </a>
                     ))}
                     <div className="mt-2 grid grid-cols-2 gap-2 border-t border-glass-border-subtle pt-4">
                        <a
                           className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-glass-border bg-inverse-surface px-4 text-sm font-semibold text-inverse-text transition-colors hover:bg-hover-surface"
                           href="https://github.com/HomeofHives/Finance-OS"
                           target="_blank"
                           rel="noreferrer"
                           onClick={closeMenu}
                        >
                           <GithubIcon className="h-4 w-4" /> Star
                        </a>
                        <Button asChild size="sm" className="w-full rounded-full">
                           <a href="#get-started" onClick={closeMenu}>
                              Get Started <ArrowRight size={15} className="text-white" />
                           </a>
                        </Button>
                     </div>
                  </nav>
               </motion.div>
            )}
         </AnimatePresence>
      </header>
   );
}
