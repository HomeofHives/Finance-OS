import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, TrendingUp, Wallet, Zap } from "lucide-react";
import { Button } from "@finance-os/ui";
import { AppleIcon, GithubIcon, GoogleIcon } from "./BrandIcons";
import { FadeIn } from "../../../shared/ui/FadeIn";

export function HeroSection() {
   const sectionRef = useRef<HTMLElement>(null);
   const prefersReducedMotion = useReducedMotion();
   const { scrollYProgress } = useScroll({
      target: sectionRef,
      offset: ["start end", "end start"],
   });
   const previewY = useTransform(scrollYProgress, [0, 1], [26, -26]);
   const orbsY = useTransform(scrollYProgress, [0, 1], [-18, 18]);

   return (
      <section className="section-hero relative overflow-hidden" id="top" ref={sectionRef}>
         <motion.div
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            style={{ y: prefersReducedMotion ? 0 : orbsY }}
         >
            <div className="glass-orb left-[8%] top-[10%] h-[420px] w-[520px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.22),transparent_65%)]" />
            <div
               className="glass-orb right-[6%] top-[18%] h-[380px] w-[480px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.14),transparent_65%)] glass-float"
               style={{ animationDelay: "1.8s" }}
            />
            <div
               className="glass-orb left-1/2 top-[55%] h-[560px] w-[720px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.07),transparent_65%)] glass-float-x"
               style={{ animationDelay: "3.2s" }}
            />
         </motion.div>
         <div className="container-page relative">
            <FadeIn delay={0.07} y={12}>
               <h1 className="display mx-auto mt-4 max-w-[880px] text-center">
                  Take complete control
                  <br />
                  <span className="text-gradient-serif">of your money.</span>
               </h1>
            </FadeIn>

            <FadeIn delay={0.13} y={10}>
               <p className="section-description mx-auto mt-6 max-w-[560px] text-center text-pretty">
                  A secure, lightning-fast open-source platform to connect all your accounts,
                  understand your spending, and plan with absolute clarity.
               </p>
            </FadeIn>

            <FadeIn delay={0.19} y={10}>
               <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Button
                     asChild
                     size="lg"
                     variant="accent"
                     className="shadow-[0_8px_24px_var(--accent-glow)]"
                  >
                     <a href="#product">
                        Explore Finance-OS <ArrowRight size={16} className="shrink-0" />
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
            </FadeIn>

            <FadeIn delay={0.26} y={8} duration={0.4}>
               <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 border-t border-glass-border-subtle pt-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
                     Connect your world
                  </span>
                  <div className="flex items-center gap-6">
                     <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-text-secondary">
                        <AppleIcon className="h-[17px] w-[17px]" /> Apple
                     </span>
                     <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-text-secondary">
                        <GoogleIcon className="h-[17px] w-[17px]" /> Google
                     </span>
                     <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-text-secondary">
                        <GithubIcon className="h-[17px] w-[17px]" /> GitHub
                     </span>
                  </div>
               </div>
            </FadeIn>

            <FadeIn delay={0.3} y={8} duration={0.4}>
               <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                  {[
                     { icon: ShieldCheck, text: "Security-first design", color: "text-gain" },
                     { icon: Zap, text: "Zero manual entry", color: "text-accent" },
                     { icon: Wallet, text: "Self-hostable & private", color: "text-accent" },
                  ].map(({ icon: Icon, text, color }) => (
                     <span
                        key={text}
                        className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3.5 py-1.5 text-xs font-medium tracking-tight text-text-secondary backdrop-blur-xl shadow-[var(--shadow-chip)]"
                     >
                        <Icon size={13} className={color} />
                        {text}
                     </span>
                  ))}
               </div>
            </FadeIn>

            <FadeIn delay={0.32} y={16} duration={0.5}>
               <motion.div
                  style={{ y: prefersReducedMotion ? 0 : previewY }}
                  className="relative mx-auto mt-12 max-w-[960px]"
               >
                  <div className="pointer-events-none absolute inset-x-12 bottom-0 h-20 bg-gradient-to-t from-accent/[0.08] to-transparent blur-2xl" />

                  <div className="relative overflow-hidden rounded-[28px] border border-glass-border bg-glass-bg p-2 shadow-[var(--shadow-panel-lg)] backdrop-blur-2xl sm:p-3">
                     <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[var(--sheen)]" />

                     <div className="relative flex items-center justify-between rounded-[18px] border border-glass-border bg-glass-bg-subtle px-4 py-3 backdrop-blur-xl">
                        <div className="flex items-center gap-1.5">
                           <span className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-sm" />
                           <span className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-sm" />
                           <span className="h-3 w-3 rounded-full bg-[#27c93f] shadow-sm" />
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3 py-1 font-mono text-[11px] text-text-secondary shadow-[var(--shadow-chip)]">
                           <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f] shadow-[0_0_6px_rgba(39,201,63,0.5)]" />{" "}
                           finance-os.app — Product preview
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                           <TrendingUp size={12} /> +14.2%
                        </span>
                     </div>

                     <div className="relative mt-2 grid gap-2 rounded-[18px] bg-glass-bg-subtle p-2 backdrop-blur-sm sm:grid-cols-12 sm:p-3">
                        <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg-strong p-5 backdrop-blur-xl shadow-[var(--shadow-chip)] sm:col-span-7">
                           <div className="pointer-events-none absolute inset-0 bg-[var(--sheen)]" />
                           <div className="relative">
                              <span className="stat-label">Total Balance</span>
                              <p className="mt-2 flex items-baseline gap-3">
                                 <span className="text-[28px] font-bold tracking-tight text-text-primary">
                                    ₹8,42,190
                                 </span>
                                 <span className="rounded-full bg-gain-bg px-2 py-0.5 text-xs font-semibold text-gain">
                                    ▲ 12.4%
                                 </span>
                              </p>
                              <div className="mt-6 flex h-[84px] items-end gap-1.5 sm:gap-2">
                                 {[38, 52, 44, 68, 58, 82, 100, 76, 88, 62].map((h, i) => (
                                    <div
                                       key={i}
                                       className="flex-1 flex flex-col justify-end h-full"
                                    >
                                       <div
                                          className={`w-full rounded-t-lg transition-all ${i === 6 ? "bg-gradient-to-t from-accent to-accent-soft shadow-[0_4px_12px_var(--accent-glow)]" : "bg-accent/15 hover:bg-accent/25"} `}
                                          style={{ height: `${h}%` }}
                                       />
                                    </div>
                                 ))}
                              </div>
                              <div className="mt-2 flex justify-between text-[10px] font-medium tracking-wide text-text-muted">
                                 <span>Jan</span>
                                 <span>Mar</span>
                                 <span>May</span>
                                 <span>Jul</span>
                                 <span>Sep</span>
                                 <span>Nov</span>
                              </div>
                           </div>
                        </div>

                        <div className="grid gap-2 sm:col-span-5">
                           <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg-strong p-4 backdrop-blur-xl shadow-[var(--shadow-chip)]">
                              <div className="pointer-events-none absolute inset-0 bg-[var(--sheen)]" />
                              <div className="relative">
                                 <span className="stat-label">Spending</span>
                                 <p className="mt-1 text-xl font-bold tracking-tight text-text-primary">
                                    ₹25,108
                                 </p>
                                 <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-glass-bg p-0.5">
                                    <div
                                       className="rounded-full bg-gradient-to-r from-accent to-accent-soft"
                                       style={{ width: "58%" }}
                                    />
                                    <div
                                       className="rounded-full bg-emerald-400 ml-0.5"
                                       style={{ width: "24%" }}
                                    />
                                    <div
                                       className="rounded-full bg-text-faint ml-0.5"
                                       style={{ width: "18%" }}
                                    />
                                 </div>
                                 <div className="mt-3 flex gap-2 text-[11px]">
                                    <span className="inline-flex items-center gap-1">
                                       <span className="h-2 w-2 rounded-full bg-accent" /> Needs
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-text-muted">
                                       <span className="h-2 w-2 rounded-full bg-emerald-400" />{" "}
                                       Wants
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-text-muted">
                                       <span className="h-2 w-2 rounded-full bg-text-faint" /> Save
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-gradient-to-br from-accent to-accent-soft p-4 text-white shadow-[0_8px_24px_var(--accent-glow)]">
                              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,transparent_60%)]" />
                              <div className="relative">
                                 <p className="text-xs font-medium opacity-80">
                                    Goal — MacBook Pro
                                 </p>
                                 <p className="mt-1 text-lg font-bold">₹1,42,000 / ₹1,99,900</p>
                                 <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
                                    <div
                                       className="h-full rounded-full bg-white"
                                       style={{ width: "71%" }}
                                    />
                                 </div>
                                 <p className="mt-1.5 text-xs opacity-80">71% — 2 months left</p>
                              </div>
                           </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg-strong p-4 backdrop-blur-xl shadow-[var(--shadow-chip)] sm:col-span-12">
                           <div className="pointer-events-none absolute inset-0 bg-[var(--sheen)]" />
                           <div className="relative flex items-center justify-between">
                              <span className="text-xs font-semibold tracking-wide text-text-muted uppercase">
                                 Recent
                              </span>
                              <span className="text-xs font-medium text-accent">View all →</span>
                           </div>
                           <div className="relative mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                              {[
                                 ["S", "Swiggy", "−₹842", "Food"],
                                 ["▲", "Salary", "+₹1,85,000", "HDFC"],
                                 ["N", "Netflix", "−₹649", "Entertainment"],
                              ].map(([letter, name, amt, cat]) => (
                                 <div
                                    key={name}
                                    className="flex items-center justify-between rounded-xl border border-glass-border bg-glass-bg px-3 py-2.5 backdrop-blur-sm"
                                 >
                                    <div className="flex items-center gap-2.5">
                                       <span
                                          className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${letter === "▲" ? "bg-gain-bg text-gain" : letter === "S" ? "bg-warning-bg text-warning" : "bg-expense-bg text-expense"}`}
                                       >
                                          {letter}
                                       </span>
                                       <div>
                                          <p className="text-xs font-semibold text-text-primary">
                                             {name}
                                          </p>
                                          <p className="text-[11px] text-text-muted">{cat}</p>
                                       </div>
                                    </div>
                                    <span
                                       className={`text-xs font-bold ${amt.startsWith("+") ? "text-gain" : "text-text-primary"}`}
                                    >
                                       {amt}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pointer-events-none hidden lg:block">
                     <div
                        className="glass-float absolute -left-6 top-[18%]"
                        style={{ animationDelay: "0.6s" }}
                     >
                        <div className="rounded-2xl border border-glass-border bg-glass-bg-strong px-4 py-3 rotate-[-4deg] shadow-[var(--shadow-float)] backdrop-blur-xl">
                           <p className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-gain shadow-[0_0_8px_rgba(5,150,105,0.4)]" />{" "}
                              +₹12,430 saved
                           </p>
                           <p className="text-[11px] text-text-muted">This month</p>
                        </div>
                     </div>
                     <div
                        className="glass-float absolute -right-4 bottom-[22%]"
                        style={{ animationDelay: "2.4s" }}
                     >
                        <div className="rounded-2xl border border-glass-border bg-glass-bg-strong px-4 py-3 rotate-[3deg] shadow-[var(--shadow-float)] backdrop-blur-xl">
                           <p className="text-xs font-semibold text-text-primary">
                              3 budgets on track ✓
                           </p>
                           <p className="text-[11px] text-text-muted">All categories healthy</p>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </FadeIn>
         </div>
      </section>
   );
}
