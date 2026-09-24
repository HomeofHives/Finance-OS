import { ArrowRight, Mail } from "lucide-react";
import { GithubIcon } from "./BrandIcons";
import { Logo } from "./Navbar";
import { Reveal } from "../../../shared/ui/Reveal";

const footerLinkClass =
   "inline-flex items-center gap-1.5 text-[13.5px] font-medium tracking-tight text-text-secondary transition-colors duration-200 hover:text-text-primary";

const productLinks = [
   { label: "Features", href: "#features" },
   { label: "Product tour", href: "#product" },
   { label: "Security", href: "#security" },
   { label: "Get started", href: "#get-started" },
];

const openSourceLinks = [
   { label: "View source", href: "https://github.com/HomeofHives/Finance-OS" },
   { label: "Release notes", href: "https://github.com/HomeofHives/Finance-OS/releases" },
   { label: "Roadmap", href: "https://github.com/HomeofHives/Finance-OS/issues" },
   { label: "Contributing", href: "https://github.com/HomeofHives/Finance-OS" },
];

export function Footer() {
   return (
      <footer className="relative section-lazy border-t border-glass-border-subtle bg-glass-bg-subtle backdrop-blur-2xl">
         <div className="pointer-events-none absolute inset-0 bg-[var(--sheen)]" />

         <div className="container-page relative">
            <Reveal>
               <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-8">
                  <div>
                     <Logo />
                     <p className="mt-4 max-w-[28ch] text-[13.5px] leading-relaxed text-text-secondary">
                        The open-source operating system for your personal finances — private,
                        self-hostable, and built in the open.
                     </p>
                     <a
                        className="mt-5 inline-flex h-9 items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 text-[13px] font-semibold tracking-tight text-inverse-text shadow-[var(--shadow-chip)] transition-all duration-200 hover:bg-glass-bg-strong hover:shadow-[var(--shadow-float)] hover:-translate-y-px"
                        href="https://github.com/HomeofHives/Finance-OS"
                        target="_blank"
                        rel="noreferrer"
                     >
                        <GithubIcon className="h-4 w-4" />
                        Star on GitHub
                     </a>
                  </div>

                  <nav aria-label="Product">
                     <h4 className="stat-label">Product</h4>
                     <ul className="mt-4 space-y-2.5">
                        {productLinks.map(({ label, href }) => (
                           <li key={label}>
                              <a className={footerLinkClass} href={href}>
                                 {label}
                              </a>
                           </li>
                        ))}
                     </ul>
                  </nav>

                  <nav aria-label="Open source">
                     <h4 className="stat-label">Open Source</h4>
                     <ul className="mt-4 space-y-2.5">
                        {openSourceLinks.map(({ label, href }) => (
                           <li key={label}>
                              <a
                                 className={footerLinkClass}
                                 href={href}
                                 target="_blank"
                                 rel="noreferrer"
                              >
                                 <GithubIcon className="h-3.5 w-3.5 text-text-muted" />
                                 {label}
                              </a>
                           </li>
                        ))}
                     </ul>
                  </nav>

                  <div>
                     <h4 className="stat-label">Stay Updated</h4>
                     <p className="mt-4 text-[13px] leading-relaxed text-text-secondary">
                        Product news and finance tips. No spam, ever.
                     </p>
                     <form
                        className="mt-4 flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg p-1 pl-3.5 shadow-[var(--shadow-chip)] backdrop-blur-xl transition-all duration-200 focus-within:border-accent/40"
                        onSubmit={(e) => e.preventDefault()}
                     >
                        <Mail size={14} className="shrink-0 text-text-muted" />
                        <input
                           type="email"
                           required
                           placeholder="you@email.com"
                           aria-label="Email address"
                           className="w-full min-w-0 bg-transparent py-1 text-[13px] tracking-tight text-text-primary placeholder:text-text-faint focus:outline-none"
                        />
                        <button
                           type="submit"
                           aria-label="Subscribe"
                           className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-gradient text-white shadow-[0_4px_12px_var(--accent-glow)] transition-transform duration-200 hover:scale-105 active:scale-95"
                        >
                           <ArrowRight size={15} className="text-white" />
                        </button>
                     </form>
                  </div>
               </div>

               <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-glass-border-subtle py-6">
                  <p className="text-xs font-medium tracking-tight text-text-muted">
                     © 2026 Finance-OS · Made in the open.
                  </p>
                  <div className="flex items-center gap-5 text-xs font-medium text-text-secondary">
                     <a
                        className="transition-colors duration-150 hover:text-text-primary"
                        href="#top"
                     >
                        Privacy
                     </a>
                     <a
                        className="transition-colors duration-150 hover:text-text-primary"
                        href="#top"
                     >
                        Terms
                     </a>
                     <a
                        className="transition-colors duration-150 hover:text-text-primary"
                        href="#top"
                     >
                        License
                     </a>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-2.5 py-1 text-[11px] font-semibold tracking-tight text-gain shadow-[var(--shadow-chip)] backdrop-blur-sm">
                     <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gain" />
                     Built in the open
                  </span>
               </div>
            </Reveal>
         </div>
      </footer>
   );
}
