import type { ComponentType } from "react";
import { ArrowRight, CreditCard, Server, Sparkles } from "lucide-react";
import { Button } from "@finance-os/ui";
import { GithubIcon } from "./BrandIcons";
import { Reveal } from "../../../shared/ui/Reveal";

const assuranceItems: ReadonlyArray<{
   label: string;
   icon: ComponentType<{ className?: string }>;
}> = [
   { label: "No credit card", icon: CreditCard },
   { label: "100% open source", icon: GithubIcon },
   { label: "Self-hostable anytime", icon: Server },
];

export function FinalCTA() {
   return (
      <section className="section section-lazy" id="get-started">
         <div className="container-page">
            <Reveal>
               <div className="relative overflow-hidden rounded-[28px] border border-glass-border bg-glass-bg p-[1px] shadow-[var(--shadow-panel-lg)] backdrop-blur-2xl">
                  <div className="relative overflow-hidden rounded-[27px] bg-gradient-to-br from-glass-bg-heavy via-glass-bg to-glass-bg-subtle px-6 py-14 text-center backdrop-blur-xl sm:px-12 sm:py-16">
                     <div className="pointer-events-none absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.10),transparent_70%)] blur-2xl" />
                     <div className="pointer-events-none absolute -right-20 -bottom-20 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08),transparent_70%)] blur-2xl" />
                     <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(109,40,217,0.05),transparent_65%)]" />

                     <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--edge)] to-transparent" />
                     <div className="pointer-events-none absolute inset-0 bg-[var(--sheen)]" />

                     <div className="relative">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3.5 py-1.5 text-xs font-semibold tracking-wide text-accent backdrop-blur-sm shadow-[var(--shadow-chip)]">
                           <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-soft text-white">
                              <Sparkles size={11} />
                           </span>
                           Start Your Journey Today
                        </span>

                        <h2 className="display-sm mx-auto mt-6 max-w-[640px] text-balance">
                           A better financial future starts with absolute control.
                        </h2>

                        <p className="section-description mx-auto mt-4 max-w-[480px] text-pretty">
                           Take the first step toward managing, saving, and growing your wealth on
                           your own terms.
                        </p>

                        <div className="mt-8 flex flex-col items-center gap-5">
                           <div className="flex flex-wrap items-center justify-center gap-3">
                              <Button
                                 asChild
                                 size="lg"
                                 variant="accent"
                                 className="shadow-[0_8px_24px_var(--accent-glow)]"
                              >
                                 <a
                                    href="https://github.com/HomeofHives/Finance-OS"
                                    target="_blank"
                                    rel="noreferrer"
                                 >
                                    Get Started Free <ArrowRight size={16} className="text-white" />
                                 </a>
                              </Button>
                              <Button asChild size="lg" variant="glass">
                                 <a
                                    href="https://github.com/HomeofHives/Finance-OS"
                                    target="_blank"
                                    rel="noreferrer"
                                 >
                                    <GithubIcon className="h-[17px] w-[17px] text-inverse-text" />
                                    Star on GitHub
                                 </a>
                              </Button>
                           </div>

                           <div className="flex flex-wrap items-center justify-center gap-2.5 border-t border-glass-border-subtle pt-5">
                              {assuranceItems.map(({ label, icon: ItemIcon }) => (
                                 <span
                                    key={label}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3.5 py-1.5 text-xs font-semibold tracking-tight text-text-secondary shadow-[var(--shadow-chip)] backdrop-blur-xl"
                                 >
                                    <ItemIcon className="h-3.5 w-3.5 text-gain" />
                                    {label}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </Reveal>
         </div>
      </section>
   );
}
